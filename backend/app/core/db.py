import json
from pathlib import Path
from sqlmodel import Session, create_engine, select, func
from app import crud
from app.core.config import settings
from app.models import User, UserCreate, Bgm, Pokemon

engine = create_engine(str(settings.SQLALCHEMY_DATABASE_URI))


# make sure all SQLModel models are imported (app.models) before initializing DB
# otherwise, SQLModel might fail to initialize relationships properly
# for more details: https://github.com/fastapi/full-stack-fastapi-template/issues/28


def init_db(session: Session) -> None:
    # Tables should be created with Alembic migrations
    # But if you don't want to use migrations, create
    # the tables un-commenting the next lines
    # from sqlmodel import SQLModel

    # This works because the models are already imported and registered from app.models
    # SQLModel.metadata.create_all(engine)

    user = session.exec(
        select(User).where(User.email == settings.FIRST_SUPERUSER)
    ).first()
    if not user:
        user_in = UserCreate(
            email=settings.FIRST_SUPERUSER,
            password=settings.FIRST_SUPERUSER_PASSWORD,
            is_superuser=True,
        )
        user = crud.create_user(session=session, user_create=user_in)

    
    # BGMの初期データをディレクトリ構造から読み込んで作成
    BGM_DATA_DIRECTORY = Path("/app/data/BGM")

    # データベースにBGMデータがまだ存在しないか確認
    count_statement = select(func.count()).select_from(Bgm)
    bgm_entry_count = session.exec(count_statement).one()

    # データが存在せず、かつBGMディレクトリが存在する場合のみ処理を実行
    if bgm_entry_count == 0 and BGM_DATA_DIRECTORY.is_dir():
        new_bgms = []
        for album_dir in BGM_DATA_DIRECTORY.iterdir():
            if album_dir.is_dir():
                # サブディレクトリ名をアルバム名とする
                album_name = album_dir.name
                for music_file in album_dir.iterdir():
                    if music_file.is_file():
                        # ファイル名から拡張子を除いた部分を曲名とする
                        title_name = music_file.stem
                        # ファイルのフルパスを文字列として取得
                        file_path_str = str(music_file)
                        new_bgms.append(Bgm(album=album_name, title=title_name, file_path=file_path_str))
                
        if new_bgms:
            session.add_all(new_bgms)
            session.commit()

    
    # ポケモン図鑑の初期データをJSONファイルから読み込んで作成
    POKEMON_JSON_PATH = Path("/app/data/Pokemon/pokemon.json")

    # データベースにポケモンデータがまだ存在しないか確認
    pokemon_count_statement = select(func.count()).select_from(Pokemon)
    pokemon_entry_count = session.exec(pokemon_count_statement).one()

    # データが存在せず、かつJSONファイルが存在する場合のみ処理を実行
    if pokemon_entry_count == 0 and POKEMON_JSON_PATH.is_file():
        print("Initializing Pokemon data from JSON file...")
        
        with open(POKEMON_JSON_PATH, "r", encoding="utf-8") as f:
            pokemon_data_list = json.load(f)
        
        new_pokemons = [
            Pokemon(
                name=p_data.get("name"),
                type1=p_data.get("type1"),
                type2=p_data.get("type2"),
                file_path=p_data.get("file_path")
            )
            for p_data in pokemon_data_list
        ]
        
        if new_pokemons:
            session.add_all(new_pokemons)
            session.commit()
            print(f"Added {len(new_pokemons)} Pokemon entries to the database.")
