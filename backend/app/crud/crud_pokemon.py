from sqlmodel import Session, select

from app.models import Pokemon


class CRUDPokemon:
    def get_all_pokemons(self, db: Session) -> list[Pokemon]:
        """
        データベースに登録されている全てのポケモンのリストを取得する
        """
        statement = select(Pokemon)
        pokemons = db.exec(statement).all()
        return pokemons

# `CRUDPokemon`クラスのインスタンスを作成
pokemon = CRUDPokemon()