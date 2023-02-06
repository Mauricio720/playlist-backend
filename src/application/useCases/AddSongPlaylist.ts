import { PlaylistRepository } from "application/repositories/PlaylistRepository";
import { SongRepository } from "application/repositories/SongRepository";
import { Playlist } from "domain/entities/Playlist";
import { Song } from "domain/entities/Song";
import { ObjectNotFound } from "domain/errors/ObjectNotFound";

export class AddSongPlaylist {
  constructor(
    private readonly playlistRepository: PlaylistRepository,
    private readonly songRepository: SongRepository
  ) {}

  async execute(idPlaylist: string, song: Song): Promise<Playlist> {
    const playlist = await this.playlistRepository.findById(idPlaylist);
    if (!playlist) {
      throw new ObjectNotFound("Playlist");
    }
    const songFinded = await this.songRepository.findById(song.id);
    if (!songFinded) {
      throw new ObjectNotFound("Song");
    }
    playlist.addSong(song);
    await this.playlistRepository.update(playlist);
    return playlist;
  }
}
