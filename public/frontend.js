import { loadSquares } from "./svg.js";
const favoriteInp = document.getElementById("favorite-inp")
const moodInp = document.getElementById("mood-inp")
const funInp = document.getElementById("fun-inp")
const letsGoBtn = document.getElementById("letsGo-btn")
const container = document.getElementById("container")



letsGoBtn.addEventListener("click", getResponse)

async function  getResponse() {
    const prompt = ` 
    Users Favorite Movie: ${favoriteInp.value}, 
    Users Mood: ${moodInp.value}, 
    Emotions User want to feel: ${funInp.value}`

    container.innerHTML = loadSquares()

    const response = await fetch("/generate", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({prompt})
    })
    const data = await response.json()
    const results = data.data
    console.log("🦾 AI-Results:", results)

    const movieCard = await Promise.all(
        results.map(async item =>{
            const searchResponse = await fetch(`https://www.omdbapi.com/?apikey=89e5c911&s=${encodeURIComponent(item.name)}`)
            const data = await searchResponse.json()
            let poster = "https://via.placeholder.com/300x450?text=No+Poster";

            if(data.Response === "True" && data.Search){
            const match = data.Search.find((movie) =>
                movie.Title.toLowerCase() === item.name.toLowerCase() && movie.Year === item.releaseDate
            )
            if(match && match.Poster !== "N/A"){
                poster = match.Poster  
            } 
        } else{
            console.warn("⚠️ No results found for:", item.name)
            console.log("OMDB said:", data.Error)
        }
        const formattedGenres = item.genre.join(", ")
        return `
       <div class="movie-container" style="background:url('${poster}')"></div>
        <div class="text-container">
            <h2 class="movieName">${item.name}</h2>
            
            <span class="ratingsGenre-flex">
                <p class="movieRatings">${item.IMDB || "N/A"}/10</p>
                <p class="movieGenres">${formattedGenres || "Unknown"}</p>
            </span>
            <p class="movieDesc">${item.description}</p>
            <span class="year-flex">
                Release Year:
                <p class="movieRelease">${item.releaseDate}</p>
            </span>
        </div>
        `
        })
    )
    container.innerHTML = movieCard.join("") + `
        <button id="goAgain-btn" class="letsGo-btn">Go Again</button>
    `
    letsGoBtn.style.display = "none"
}

document.getElementById("goAgain-btn").addEventListener("click", ()=>{
    window.location.reload()
})