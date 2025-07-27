from sqlmodel import Session, select

from app.models import Bgm


class CRUDBgm:
    def get_all_bgms(self, db: Session) -> list[Bgm]:
        """
        すべてのBGMを、アルバム名と曲名でソートして取得する
        """
        statement = select(Bgm).order_by(Bgm.album, Bgm.title)
        result = db.exec(statement)
        return result.all()


bgm = CRUDBgm()