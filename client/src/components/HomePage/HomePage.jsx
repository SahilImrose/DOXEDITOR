import React, { useContext } from 'react'
import { Redirect } from 'react-router'
import { useHistory } from 'react-router-dom'
import AuthContext from '../../context/AuthContext'
import './HomePage.css'

const HomePage = () => {

    const { loggedIn } = useContext(AuthContext)
    const history = useHistory()
    let imageName = require("../../images/simpleDocsSS1.JPG")

    const homeNotLoggedIn = (
        <></>
    )

    return (
        <>
            {/* <Navbar /> */}

            {
                loggedIn ? <Redirect to="/dashboard" /> : <Redirect to="/login" />
            }

        </>

    )
}

export default HomePage
