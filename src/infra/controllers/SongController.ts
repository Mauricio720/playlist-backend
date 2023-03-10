import { AlbumRepository } from "application/repositories/AlbumRepository";
import { ArtistRepository } from "application/repositories/ArtistRepository";
import { CategogyRepository } from "application/repositories/CategoryRepository";
import { SongRepository } from "application/repositories/SongRepository";
import { UserRepository } from "application/repositories/UserRepository";
import { ChangePublicSong } from "application/useCases/ChangePublicSong";
import { CreateSong } from "application/useCases/CreateSong";
import { FieldMissing } from "domain/errors/FieldMissing";
import { NotAuthorized } from "domain/errors/NotAuthorized";
import { Server } from "infra/http/Server";
import { Auth } from "infra/security/Auth";
import { GateAdapter } from "infra/security/GateAdapter";
import { Identifier } from "infra/security/Identifier";
import { Storage } from "infra/storage/Storage";

export class SongController {
  constructor(
    private readonly server: Server,
    private readonly songRepository: SongRepository,
    private readonly artistRepository: ArtistRepository,
    private readonly albumRepository: AlbumRepository,
    private readonly userRepository: UserRepository,
    private readonly categoryRepository: CategogyRepository,
    private readonly identifier: Identifier,
    private readonly storage: Storage
  ) {
    this.server.post(
      "/song",
      this.storage.middlewareMultiple([
        { name: "songFile", path: "/songs" },
        { name: "albumImage", path: "/images/albuns" },
        { name: "artistImage", path: "/images/artists" },
      ]),
      async (req, res) => {
        try {
          if (!(await GateAdapter.allows("JUST_ADM"))) {
            throw new NotAuthorized();
          }

          const createSong = new CreateSong(
            this.songRepository,
            this.artistRepository,
            this.albumRepository,
            this.userRepository,
            this.categoryRepository,
            this.identifier
          );

          if (!req.files.songFile) {
            throw new FieldMissing("Song File");
          }

          const song = await createSong.execute(
            JSON.parse(req.body.song),
            req.files.songFile[0].location,
            req.files.artistImage
              ? req.files.artistImage[0].location
              : undefined,
            req.files.albumImage ? req.files.albumImage[0].location : undefined
          );
          res.json(song).end();
        } catch (err) {
          if (req.files.songFile) {
            this.storage.deleteFile(req.files.songFile[0].key);
          }

          if (req.files.albumImage) {
            this.storage.deleteFile(req.files.albumImage[0].key);
          }

          res.status(400).json(err.message).end();
        }
      }
    );

    this.server.get("/song", async (req, res) => {
      try {
        const song = await this.songRepository.findById(req.query.id);
        res.json(song).end();
      } catch (err) {
        res.status(400).json(err.message).end();
      }
    });

    this.server.put("/change_public_song", async (req, res) => {
      try {
        const createSong = new ChangePublicSong(this.songRepository);
        await createSong.execute(req.body.id);
        res.end();
      } catch (err) {
        res.status(400).json(err.message).end();
      }
    });

    this.server.get("/all_songs", async (req, res) => {
      try {
        const songs = await this.songRepository.list(
          req.query.name ? req.query.name : ""
        );
        res.json(songs).end();
      } catch (err) {
        res.status(400).json(err.message).end();
      }
    });
  }
}
