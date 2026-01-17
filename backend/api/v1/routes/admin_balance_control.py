"""
Admin Balance Control - Manual load/withdraw for clients
All operations go through approval_service and emit Telegram notifications

SECURITY: All endpoints require admin authentication.
"""
from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Request, Header
from pydantic import BaseModel, Field
import uuid
from datetime import datetime, timezone
import logging
import json

from ..core.database import get_pool
from ..core.auth import get_current_user, AuthenticatedUser

router = APIRouter(prefix="/admin/balance-control", tags=["admin_balance"])
logger = logging.getLogger(__name__)


# ==================== AUTH HELPER ====================

async def require_admin_for_balance(
    request: Request,
    authorization: str = Header(..., alias="Authorization")
) -> AuthenticatedUser:
    """Require admin role for balance control operations."""
    user = await get_current_user(request, authorization, None)
    
    if not user.is_admin:
        raise HTTPException(
            status_code=403, 
            detail={"message": "Admin access required for balance control", "error_code": "E1007"}
        )
    
    return user


class ManualBalanceRequest(BaseModel):
    user_id: str
    amount: float = Field(gt=0)
    reason: str = Field(min_length=5, description="Required reason for manual adjustment")


@router.post("/load")
async def admin_manual_load(
    request_data: ManualBalanceRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    authorization: str = Header(..., alias="Authorization"),
    admin: AuthenticatedUser = Depends(require_admin_for_balance)
):
    """
    Admin manually loads client balance
    - Creates order (type: admin_manual_load)
    - Sends to Telegram for approval
    - Logs in ledger after approval
    
    SECURITY: Requires admin authentication.
    """
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Get user
        user = await conn.fetchrow("""
            SELECT user_id, username, real_balance
            FROM users WHERE user_id = $1
        """, request_data.user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create order
        order_id = str(uuid.uuid4())
        
        await conn.execute("""
            INSERT INTO orders (
                order_id, user_id, username,
                order_type, amount, total_amount,
                status, metadata, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        """, order_id, user['user_id'], user['username'],
             'admin_manual_load', request_data.amount, request_data.amount,
             'pending_approval', json.dumps({
                 'reason': request_data.reason,
                 'admin_action': True,
                 'initiated_by': admin.username,
                 'requires_telegram_approval': True
             }))
        
        # Send to Telegram
        background_tasks.add_task(send_admin_action_telegram, order_id, 'load', request_data.reason)
        
        return {
            "success": True,
            "order_id": order_id,
            "message": f"Manual load request created for ${request_data.amount:.2f}. Awaiting Telegram approval.",
            "user": user['username']
        }


@router.post("/withdraw")
async def admin_manual_withdraw(
    request_data: ManualBalanceRequest,
    background_tasks: BackgroundTasks,
    request: Request,
    authorization: str = Header(..., alias="Authorization"),
    admin: AuthenticatedUser = Depends(require_admin_for_balance)
):
    """
    Admin manually withdraws client balance
    - Creates order (type: admin_manual_withdraw)
    - Sends to Telegram for approval
    - Deducts balance after approval
    
    SECURITY: Requires admin authentication.
    """
    pool = await get_pool()
    
    async with pool.acquire() as conn:
        # Get user
        user = await conn.fetchrow("""
            SELECT user_id, username, real_balance
            FROM users WHERE user_id = $1
        """, request_data.user_id)
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if float(user['real_balance']) < request_data.amount:
            raise HTTPException(status_code=400, detail="Insufficient balance")
        
        # Create order
        order_id = str(uuid.uuid4())
        
        await conn.execute("""
            INSERT INTO orders (
                order_id, user_id, username,
                order_type, amount, total_amount,
                status, metadata, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
        """, order_id, user['user_id'], user['username'],
             'admin_manual_withdraw', request_data.amount, request_data.amount,
             'pending_approval', json.dumps({
                 'reason': request_data.reason,
                 'admin_action': True,
                 'initiated_by': admin.username,
                 'requires_telegram_approval': True,
                 'balance_before': float(user['real_balance'])
             }))
        
        # Send to Telegram
        background_tasks.add_task(send_admin_action_telegram, order_id, 'withdraw', request_data.reason)
        
        return {
            "success": True,
            "order_id": order_id,
            "message": f"Manual withdraw request created for ${request_data.amount:.2f}. Awaiting Telegram approval.",
            "user": user['username']
        }


async def send_admin_action_telegram(order_id: str, action_type: str, reason: str):
    """Send admin manual action to Telegram for approval"""
    from telegram import Bot, InlineKeyboardButton, InlineKeyboardMarkup
    import os
    
    # Get tokens from environment (not hardcoded)
    BOT_TOKEN = os.environ.get('TELEGRAM_BOT_TOKEN', '')
    CHAT_ID = os.environ.get('TELEGRAM_CHAT_ID', '')
    
    if not BOT_TOKEN or not CHAT_ID:
        logger.warning("Telegram not configured - skipping notification")
        return
    
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            order = await conn.fetchrow("""
                SELECT order_id, username, amount
                FROM orders WHERE order_id = $1
            """, order_id)
            
            if not order:
                return
            
            bot = Bot(token=BOT_TOKEN)
            
            if action_type == 'load':
                emoji = "➕"
                title = "Admin Manual Load"
            else:
                emoji = "➖"
                title = "Admin Manual Withdraw"
            
            message = f"""
{emoji} <b>{title}</b>

📋 <b>Order:</b> <code>{order_id[:8]}</code>
👤 <b>User:</b> {order['username']}
💰 <b>Amount:</b> ${order['amount']:.2f}
📝 <b>Reason:</b> {reason}
⏰ <b>Time:</b> {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}

<i>⚠️ Admin-initiated balance adjustment</i>
"""
            
            keyboard = [
                [
                    InlineKeyboardButton("✅ Approve", callback_data=f"approve_{order_id}"),
                    InlineKeyboardButton("❌ Reject", callback_data=f"failed_{order_id}"),
                ]
            ]
            reply_markup = InlineKeyboardMarkup(keyboard)
            
            sent = await bot.send_message(
                chat_id=CHAT_ID,
                text=message,
                parse_mode='HTML',
                reply_markup=reply_markup
            )
            
            await conn.execute("""
                UPDATE orders 
                SET telegram_message_id = $1, telegram_chat_id = $2
                WHERE order_id = $3
            """, str(sent.message_id), str(CHAT_ID), order_id)
    except Exception as e:
        logger.error(f"Failed to send Telegram notification: {e}")
