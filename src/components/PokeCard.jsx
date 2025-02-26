import { useEffect,useState } from "react"
import { getFullPokedexNumber, getPokedexNumber } from "../ultis"
import TypeCard from './TypeCard'
import Modal from "./Modal"

export default function PokeCard(props){
    const {selectedPokemon}=props
    const [data,setData]=useState(null)
    const [loading,setLoading]=useState(false)
    const [skill,setSkill]=useState(null)
    const [loadingSkill,setLoadingSkill]=useState(false)

    const {name,height,abilities,stats,types,moves,sprites}=data || {}

    const imgList=Object.keys(sprites || {}).filter(val=>{
            if(!sprites[val]) {return false}
            if(['versions','other'].includes(val)) {return false }
            return true
    })

    async function fetchMoveData(move,moveUrl) {
        if(loadingSkill || !localStorage || !moveUrl) {return}

        let cachemove={}
        if(localStorage.getItem('pokemon-moves')){
            cachemove=JSON.parse(localStorage.getItem('pokemon-moves'))
        }

        if(move in cachemove){
            setSkill(cachemove[move])
            console.log('found move')
            return
        }
        try{
            setLoadingSkill(true)
            const res= await fetch(moveUrl)
            const moveData= await res.json()
            const description=moveData?.flavor_text_entries.filter(
                val=>{
                    return val.version_group.name == 'firered-leafgreen'
                }
            )[0]?.flavor_text

            const skillData={
                name:move,
                description
            }
            setSkill(skillData)
            cachemove[move]=skillData
            localStorage.setItem('pokemon-moves',JSON.stringify(cachemove))
        }catch(err){
            console.log(err)
        }finally{
            setLoadingSkill(false)
        }
    }

    useEffect(()=>{
        //kiem tra neu dang load hoac k co du lieu trong localstroage =>exit loop
        if(loading || !localStorage ) {return}
        // ktra xem du lieu co trong cache ko
        //1 define cache
        let cache={}
        if(localStorage.getItem('pokedex')){
            cache=JSON.parse(localStorage.getItem('pokedex'))
        }
        //2 ktra xem trong cache co du lieu khong, neu k thi fetch tu API
        if(selectedPokemon in cache){
            setData(cache[selectedPokemon])
            console.log('found data')
            return
        }
        //2.2 fetch tu API
        async function fetchPokemonData() {
            setLoading(true )
            try{
                const baseUrl='https://pokeapi.co/api/v2/'
                const suffix ='pokemon/'+ getPokedexNumber(selectedPokemon)
                const finalUrl=baseUrl + suffix
                const res=await fetch(finalUrl)
                const pokemonData=await res.json()
                setData(pokemonData)
                console.log('fetched pokemon successfully')
                cache[selectedPokemon]=pokemonData
                localStorage.setItem('pokedex',JSON.stringify(cache))
            }catch(err){
                console.log(err.message)
            }finally{
                setLoading(false)
            }
        }
        fetchPokemonData()
        
    },[selectedPokemon])

    if(loading||!data) return(
        <h3>Loading...</h3>
    )
    return(
        <>
            <div className="poke-card">
                {skill && (
                    <Modal handleCloseModal={()=>{setSkill(null)}} >
                    <div>
                        <h6>Name</h6>
                        <h2 className="skill-name">{skill.name.replaceAll('-',' ')}</h2>
                    </div>
                    <div>
                        <h6>Description</h6>
                        <p>{skill.description || "No description"}</p>
                    </div>
                </Modal>
                )}
                <div>
                    <h4>#{getFullPokedexNumber(selectedPokemon)}</h4>
                    <h2>{name}</h2>
                </div>
                <div className="type-container">
                    {types.map((typeObj,typeIndex)=>{
                        return (
                            <TypeCard key={typeIndex} type={typeObj?.type?.name}/>
                        )
                    })}
                </div>
                <div className="default-container">
                    <img className="default-img" src={'/pokemon/'+getFullPokedexNumber(selectedPokemon)+'.png'} alt={`${name}-large-img`}/>
                </div>
                <div className="img-container">
                    {imgList.map((spriteUrl,spriteIndex)=>{
                            const imgUrl = sprites[spriteUrl]
                            return(                              
                                    <img className="poke-img"  key={spriteIndex} src={imgUrl} alt={`${name}-img-${spriteUrl}`}/>                               
                            )
                    })}
                </div>
                <h3>Stats</h3>
                <div className="stats-card">
                    {stats.map((statObj,statIndex)=>{
                        const {stat,base_stat}=statObj
                        return(
                            <div key={statIndex} className="stat-item">
                                <p>{stat?.name.replaceAll('-',' ')}</p>
                                <h4>{base_stat}</h4>
                            </div>
                        )
                    })}
                </div>
                <h3>Moves</h3>
                <div className="pokemon-move-grid">
                    {moves.map((moveObj,moveIndex)=>{
                        return (
                            <button className='button-card pokemon-move' key={moveIndex} onClick={() => {
                                fetchMoveData(moveObj?.move?.name,moveObj?.move?.url)
                            }}>
                                <p>{moveObj?.move?.name.replaceAll('-', ' ')}</p>
                            </button>
                        )
                    })}
                </div>
            </div>
        
        </>
    )
}