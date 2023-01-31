import "dotenv/config";
import { CreateSong, CreateSongDTO } from "application/useCases/CreateSong";
import assert from "assert";
import { ObjectNotFound } from "domain/errors/ObjectNotFound";
import { AlbumRepositoryMemory } from "infra/repositories/memory/AlbumRepositoryMemory";
import { ArtistRepositoryMemory } from "infra/repositories/memory/ArtistRepositoryMemory";
import { SongRepositoryMemory } from "infra/repositories/memory/SongRepositoryMemory";
import { Identifier } from "infra/security/Identifier";
import { CreateAlbum } from "application/useCases/CreateAlbum";
import { CreateArtist } from "application/useCases/CreateArtist";
import { UserRepositoryMemory } from "infra/repositories/memory/UserRepositoryMemory";
import { CreateUser } from "application/useCases/CreateUser";
import { Encrypt } from "infra/security/Encrypt";
import { Authenticator } from "infra/security/Authenticator";
import { CategoryRepositoryMemory } from "infra/repositories/memory/CategoryRepositoryMemory";
import { User } from "domain/entities/User";

describe("Create Song", async () => {
  const identifier: Identifier = {
    createId() {
      return "1";
    },
  };

  const INITIAL_VALUE: CreateSongDTO = {
    title: "any",
    category: {
      id: "any",
      name: "any",
    },
    duration: 1.0,
    artist: {
      id: "any",
      name: "any",
      picture: "any",
    },
    album: {
      id: "any",
      name: "any",
      year: "any",
      cover: "any",
      artist: {
        id: "any",
        name: "any",
        picture: "any",
      },
    },
    userId: "any",
  };

  const encrypt: Encrypt = {
    async compare(password, encripted) {
      return `${password}_enc` === encripted;
    },
    encript(password) {
      return `${password}_enc`;
    },
  };

  const INITIAL_VALUES_USER: User.Props = {
    id: "any",
    name: "any",
    email: "any@any.com",
    password: "any",
    dateRegister: new Date(),
    favoriteCategory: [],
    favoriteArtist: [],
  };

  const songRepository = new SongRepositoryMemory();
  const artistRepository = new ArtistRepositoryMemory();
  const albumRepository = new AlbumRepositoryMemory();
  const userRepository = new UserRepositoryMemory();
  const categoryRepository = new CategoryRepositoryMemory();

  const createAlbum = new CreateAlbum(
    albumRepository,
    artistRepository,
    identifier
  );

  const createArtist = new CreateArtist(identifier, artistRepository);

  const createSong = new CreateSong(
    songRepository,
    artistRepository,
    albumRepository,
    identifier
  );

  const authenticador: Authenticator = {
    createToken() {
      return "any token";
    },
    decoder() {},
  };

  const createUser = new CreateUser(
    identifier,
    encrypt,
    authenticador,
    userRepository,
    artistRepository,
    categoryRepository
  );

  await createUser.execute(INITIAL_VALUES_USER);
  await createArtist.execute(INITIAL_VALUE.artist);
  await createAlbum.execute({ ...INITIAL_VALUE.album, songs: [] });

  it("should create new song", async () => {
    const song = await createSong.execute(INITIAL_VALUE, "any");

    assert.deepEqual(song.id, "1");
    assert.deepEqual(song.title, "any");
    assert.deepEqual(song.category.id, "any");
    assert.deepEqual(song.category.name, "any");
    assert.deepEqual(song.duration, 1);
    assert.deepEqual(song.pathSongFile, `${process.env.URI_BACKEND}any`);
    assert.deepEqual(song.artist.id, "any");
    assert.deepEqual(song.artist.name, "any");
    assert.deepEqual(song.artist.picture, "any");
    assert.deepEqual(
      new Date(song.dateRegister).toDateString(),
      new Date().toDateString()
    );
    assert.deepEqual(song.album.id, "any");
    assert.deepEqual(song.album.name, "any");
    assert.deepEqual(song.album.year, "any");
    assert.deepEqual(song.album.cover, "any");
    assert.deepEqual(song.userId, "any");
  });

  it("should create new artist when id is not send", async () => {
    const song = await createSong.execute(
      { ...INITIAL_VALUE, artist: { ...INITIAL_VALUE.artist, id: "" } },
      "any"
    );

    assert.deepEqual(song.artist.id, "1");
  });

  it("should create new album when id is not send", async () => {
    const song = await createSong.execute(
      {
        ...INITIAL_VALUE,
        album: {
          ...INITIAL_VALUE.album,
          id: "",
          artist: { ...INITIAL_VALUE.album, id: "" },
        },
      },
      "any"
    );

    assert.deepEqual(song.album.id, "1");
  });

  it("should throw when not found album", async () => {
    await assert.rejects(async () => {
      await createSong.execute(
        {
          ...INITIAL_VALUE,
          album: {
            ...INITIAL_VALUE.album,
            id: "wrongId",
          },
        },
        "any"
      );
    }, new ObjectNotFound("Album"));
  });

  it("should throw when not found artist", async () => {
    await assert.rejects(async () => {
      await createSong.execute(
        {
          ...INITIAL_VALUE,
          album: {
            ...INITIAL_VALUE.album,
            artist: { ...INITIAL_VALUE.album.artist, id: "wrongId" },
          },
        },
        "any"
      );
    }, new ObjectNotFound("Artist"));
  });

  it("throw user not found", async () => {
    await assert.rejects(async () => {
      await createSong.execute({ ...INITIAL_VALUE, userId: "wrongId" }, "any");
    }, new ObjectNotFound("User"));
  });
});
