import assert from "assert"
import { Song } from "domain/entities/Song"
import { FieldMissing } from "domain/errors/FieldMissing"

describe('Song',()=>{
    const INITIAL_VALUES:Song.Props={
        id:"any",
        title:"any",
        category:{
            id:"any",
            name:"any",
        },
        duration:1.0,
        pathSongFile:"any",
        artist:{
            id:"any",
            name:"any",
            picture:"any"
        },
        album:{
            id:"any",
            name:"any",
            year:"any",
            cover:"any",
            artist:{
                id:"any",
                name:"any",
                picture:"any"
            }
        },
        user:{
            id:"any",
            name:"any",
            email:"any@any.com",
        }
    }

    it("should create song",()=>{
        const song=new Song(INITIAL_VALUES)
        
        assert.deepEqual(song.id,"any")
        assert.deepEqual(song.title,"any")
        assert.deepEqual(song.category.id,"any")
        assert.deepEqual(song.category.name,"any")
        assert.deepEqual(song.duration,1.0)
        assert.deepEqual(song.pathSongFile,`${process.env.URI_BACKEND}any`)
        assert.deepEqual(song.artist.id,"any")
        assert.deepEqual(song.artist.name,"any")
        assert.deepEqual(song.artist.picture,"any")
        assert.deepEqual(
            new Date(song.dateRegister).toDateString(),
            new Date().toDateString()
        );
        assert.deepEqual(song.album.id,"any")
        assert.deepEqual(song.album.name,"any")
        assert.deepEqual(song.album.year,"any")
        assert.deepEqual(song.album.cover,"any")
        assert.deepEqual(song.album.cover,"any")
        assert.deepEqual(song.album.artist.id,"any")
        assert.deepEqual(song.album.artist.name,"any")
        assert.deepEqual(song.album.artist.picture,"any")
        assert.deepEqual(song.user.id,"any")
        assert.deepEqual(song.user.name,"any")
        assert.deepEqual(song.user.email,"any@any.com")
    })

    it("throw error missing attributes songs",async ()=>{
        assert.throws(() => {
            new Song({...INITIAL_VALUES,
                title:"",
                category:null,
                duration:1.0,
                pathSongFile:"",
                artist:null,
                album:null,
                user:null
            })
        }, new FieldMissing("Title or Category or Duration or PathSongFile or Artist or Album or User"));
    });
})