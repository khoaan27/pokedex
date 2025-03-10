import { pokemonTypeColors } from "../ultis"

export default function TypeCard(props){
    const {type}=props
    return(
        <>
            <div className="type-tile" style={{color:pokemonTypeColors?.[type]?.color, backgroundColor:pokemonTypeColors?.[type]?.background}}>
                <p>
                    {type}
                </p>
            </div>
        </>
    )
}