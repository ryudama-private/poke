from fastapi import APIRouter

from app.api.deps import SessionDep
from app.crud.crud_bgm import bgm as crud_bgm
from app.models import BgmPublic

router = APIRouter()


@router.get("", response_model=list[BgmPublic])
def read_bgms(
    session: SessionDep,
):
    """
    データベースに登録されている全てのBGMのリストをJSONで返す
    """
    bgms = crud_bgm.get_all_bgms(db=session)
    return bgms