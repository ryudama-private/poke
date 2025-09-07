from fastapi import APIRouter, HTTPException
from openai import OpenAI
from pydantic import BaseModel
from azure.core.credentials import AzureKeyCredential
from azure.search.documents import SearchClient

from app.core.config import settings
from app.models import Message

router = APIRouter()

class ChatRequest(BaseModel):
    message: str

def get_search_client(query: str):
    """
    クエリに基づいて、適切なAzure AI Searchクライアントを返します。
    """
    # クエリに「bgm」「曲」「音楽」「テーマ」などのキーワードが含まれている場合、BGMインデックスを使用します
    if any(keyword in query.lower() for keyword in ["bgm", "曲", "音楽", "テーマ", "マサラタウン"]):
        index_name = "bgms-index"
    else:
        index_name = "pokemons-index"

    return SearchClient(
        endpoint=settings.AZURE_SEARCH_ENDPOINT,
        index_name=index_name,
        credential=AzureKeyCredential(settings.AZURE_SEARCH_ADMIN_KEY)
    )

def search_azure_ai(query: str, search_client: SearchClient):
    """
    Azure AI Searchで検索を実行し、結果をリストで返します。
    """
    try:
        results = search_client.search(search_text=query)
        return list(results)
    except Exception as e:
        print(f"Azure AI Searchの検索中にエラーが発生しました: {e}")
        return []
        
@router.post("", response_model=Message)
def handle_chat(chat_request: ChatRequest):
    """
    ユーザーからのメッセージを受け取り、Azure AI Searchの結果を基にOpenAI APIからの応答を返す
    """
    if not settings.OPENAI_API_KEY:
        raise HTTPException(
            status_code=500,
            detail="OpenAI API key is not configured.",
        )

    try:
        # 1. ユーザーのメッセージに基づいてAzure AI Searchで検索
        search_client = get_search_client(chat_request.message)
        search_results = search_azure_ai(chat_request.message, search_client)

        context_text = ""
        if search_results:
            # 検索結果をコンテキストとして整形
            for doc in search_results:
                # ドキュメントのフィールド名に合わせて処理を分岐
                if 'name' in doc and 'type1' in doc: # ポケモンデータの場合
                    context_text += f"名前: {doc['name']}, タイプ: {doc['type1']}, {doc['type2']}\n"
                elif 'title' in doc and 'album' in doc: # BGMデータの場合
                    context_text += f"タイトル: {doc['title']}, アルバム: {doc['album']}\n"
                else:
                    context_text += f"{doc}\n"

        # 2. 検索結果をOpenAIへのプロンプトに統合
        system_content = "あなたはポケモンの専門家であるAIです。提供された情報を基に、ユーザーの質問に正確に答えてください。情報が見つからない場合は、見つからないと伝えてください。"
        
        user_content = f"質問: {chat_request.message}\n\n関連情報:\n{context_text}"
        
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": system_content,
                },
                {"role": "user", "content": user_content},
            ],
        )
        response_message = completion.choices[0].message.content
        if response_message is None:
            raise HTTPException(status_code=500, detail="No response from OpenAI.")

        return Message(message=response_message)

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
