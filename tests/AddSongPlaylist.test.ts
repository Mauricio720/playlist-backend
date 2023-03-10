import { AddSongPlaylist } from "application/useCases/AddSongPlaylist";
import { CreateArtist } from "application/useCases/CreateArtist";
import { CreateCategory } from "application/useCases/CreateCategory";
import { CreatePlaylist } from "application/useCases/CreatePlaylst";
import { CreateUser } from "application/useCases/CreateUser";
import assert from "assert";
import { Playlist } from "domain/entities/Playlist";
import { Song } from "domain/entities/Song";
import { User } from "domain/entities/User";
import { ObjectNotFound } from "domain/errors/ObjectNotFound";
import { ArtistRepositoryMemory } from "infra/repositories/memory/ArtistRepositoryMemory";
import { CategoryRepositoryMemory } from "infra/repositories/memory/CategoryRepositoryMemory";
import { PlaylistRepositoryMemory } from "infra/repositories/memory/PlaylistRepository";
import { SongRepositoryMemory } from "infra/repositories/memory/SongRepositoryMemory";
import { UserRepositoryMemory } from "infra/repositories/memory/UserRepositoryMemory";
import { Authenticator } from "infra/security/Authenticator";
import { Encrypt } from "infra/security/Encrypt";
import { Identifier } from "infra/security/Identifier";

describe("Should Add Song In Playlist", async () => {
  const identifier: Identifier = {
    createId() {
      return "1";
    },
  };

  const INITIAL_VALUES: Playlist.Props = {
    id: "1",
    title: "any",
    userId: "any",
    songs: [
      {
        id: "any",
        title: "any",
        category: {
          id: "any",
          name: "any",
        },
        duration: 1.0,
        pathSongFile: "any",
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
      },
    ],
  };

  const INITIAL_VALUES_USER: Omit<User.Props, "id"> = {
    name: "any",
    email: "any@any.com",
    permission: "Adm",
    password: "any",
    favoriteCategory: [{ id: "1", name: "rock" }],
    favoriteArtist: [{ id: "1", name: "any" }],
  };

  const encrypt: Encrypt = {
    async compare(password, encripted) {
      return `${password}_enc` === encripted;
    },
    encript(password) {
      return `${password}_enc`;
    },
  };

  const authenticador: Authenticator = {
    createToken() {
      return "any token";
    },
    decoder() {},
  };

  const userRepository = new UserRepositoryMemory();
  const artistRepository = new ArtistRepositoryMemory();
  const categoryRepository = new CategoryRepositoryMemory();
  const playlistRepository = new PlaylistRepositoryMemory();
  const songRepository = new SongRepositoryMemory();

  const createUser = new CreateUser(
    identifier,
    encrypt,
    authenticador,
    userRepository,
    artistRepository,
    categoryRepository
  );
  const createArtist = new CreateArtist(identifier, artistRepository);
  const createCategory = new CreateCategory(identifier, categoryRepository);
  const createPlaylist = new CreatePlaylist(
    playlistRepository,
    songRepository,
    userRepository,
    identifier
  );
  const addSongPlaylist = new AddSongPlaylist(
    playlistRepository,
    songRepository
  );

  await createArtist.execute({ name: "newArtist" });
  await createCategory.execute("Rock");
  await createUser.execute(INITIAL_VALUES_USER);
  await songRepository.create(INITIAL_VALUES.songs[0] as Song);
  const playlist = await createPlaylist.execute(INITIAL_VALUES);

  const newSongValues = {
    id: "any2",
    title: "any2",
    category: {
      id: "any",
      name: "any",
    },
    duration: 1.0,
    pathSongFile: "any",
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
    },
    userId: "any",
  };

  const newSong = await songRepository.create(newSongValues as Song);

  it("should add song in playlist", async () => {
    const actualPlaylist = await addSongPlaylist.execute(playlist.id, newSong);
    assert.deepEqual(actualPlaylist.songs.length, 2);
  });

  it("throw playlist not found", async () => {
    await assert.rejects(async () => {
      await addSongPlaylist.execute("wrongId", newSong);
    }, new ObjectNotFound("Playlist"));
  });

  it("throw song not found", async () => {
    await assert.rejects(async () => {
      await addSongPlaylist.execute(playlist.id, {
        ...newSongValues,
        id: "wrongId",
      } as Song);
    }, new ObjectNotFound("Song"));
  });
});
