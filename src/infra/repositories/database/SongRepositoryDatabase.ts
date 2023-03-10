import { SongRepository } from "application/repositories/SongRepository";
import { Song } from "domain/entities/Song";
import { Database } from "infra/database/Database";

export class SongRepositoryDatabase implements SongRepository {
  constructor(private readonly connection: Database) {
    this.connection.setDatabase("songs");
  }

  async list(nameSongLetter: string): Promise<Song[]> {
    const regex = new RegExp(nameSongLetter, "i");

    const response = await this.connection.get<Song>(
      nameSongLetter
        ? {
            title: { $regex: regex },
          }
        : {}
    );
    const songs = [];

    for (const song of response) {
      songs.push(new Song(song));
    }

    return songs;
  }

  async create(song: Song): Promise<Song> {
    await this.connection.create(song);
    return song;
  }

  async update(song: Song): Promise<Song> {
    await this.connection.update({ id: song.id }, song);
    return song;
  }

  async delete(id: string): Promise<Song> {
    await this.connection.update({ id }, { active: false });
    return await this.findById(id);
  }

  async findById(id: string): Promise<Song | null> {
    const songs = await this.connection.get({ id });
    if (!songs[0]) {
      return null;
    }

    return new Song(songs[0]);
  }

  async findByName(name: string): Promise<Song | null> {
    const songs = await this.connection.get({ title: name });
    if (!songs[0]) {
      return null;
    }

    return new Song(songs[0]);
  }
}
