from fastapi import APIRouter, Depends
from sqlmodel import Session

from app import crud
from app.api.deps import get_db
from app.models import PokemonPublic

router = APIRouter()


@router.get("/", response_model=list[PokemonPublic])
def read_pokemons(db: Session = Depends(get_db)):
    """
    全てのポケモン図鑑データを取得する
    """
    pokemons = crud.pokemon.get_all_pokemons(db=db)
    return pokemons
