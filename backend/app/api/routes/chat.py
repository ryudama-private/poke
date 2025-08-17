from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel

from app.core.config import settings
from app.models import Message

router = APIRouter()


class ChatRequest(BaseModel):
    message: str


@router.post("/", response_model=Message)
def handle_chat(chat_request: ChatRequest):
    """
    ユーザーからのメッセージを受け取り、OpenAI APIからの応答を返す
    """
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key is not configured.",
        )

    try:
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant.",
                },
                {"role": "user", "content": chat_request.message},
            ],
        )
        response_message = completion.choices[0].message.content
        if response_message is None:
            raise HTTPException(status_code=500, detail="No response from OpenAI.")

        return Message(message=response_message)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))