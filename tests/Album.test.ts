import assert from "assert"
import { Album } from "domain/entities/Album"
import { Artist } from "domain/entities/Artist"
import { FieldMissing } from "domain/errors/FieldMissing"

describe("Album",()=>{
    const INITIAL_VALUES:Album={
        id:"any",
        name:"any",
        year:"any",
        artist:{
            id:"any",
            name:"any",
            picture:"any"
        },
        cover:"any",
    }

    it("should create album",()=>{
        const album=new Album(INITIAL_VALUES);
        
        assert.deepEqual(album.id,'any')
        assert.deepEqual(album.name,'any')
        assert.deepEqual(album.year,'any')
        assert.deepEqual(album.artist.id,'any')
        assert.deepEqual(album.artist.name,'any')
        assert.deepEqual(album.artist.picture,'any')
        assert.deepEqual(album.cover,'any')
    })
    
    it('throw error name or year or artist missing album',()=>{
        assert.throws(() => {
            new Album({ ...INITIAL_VALUES, name: "", year: "", artist:null });
          }, new FieldMissing("Name and Year and Artist"));
    });
})