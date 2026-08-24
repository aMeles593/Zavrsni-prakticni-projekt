import axios from "axios";

export async function fetchMatchEvents(id){
    const url = `${process.env.API_URL}/fixtures/events?fixture=${id}`;
    const response = await fetch(url,{
        headers:{
            'x-apisports-key':process.env.API_KEY
        }
    });

    if(!response.ok){
        throw new Error(
            `API error ${response.status}`
        );
    }
    const data = await response.json();
    return data.response;
}