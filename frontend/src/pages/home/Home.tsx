import { useNavigate } from "react-router-dom"
import CustomLoading from "../../components/customLoading/CustomLoading"
import { useEffect } from "react"


const Home = () => {
    const redirect = useNavigate()

    useEffect(() =>{
        redirect('/session')
    }, [])

    return (
        <CustomLoading/>
    )
}

export default Home