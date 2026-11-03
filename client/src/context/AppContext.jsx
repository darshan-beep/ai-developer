import{createContext, useState,useEffect} from 'react'
import { useContext } from 'react'
import api from '../api/api'
import {toast} from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'



const AppContext = createContext(undefined)
 export function AppContextProvider({children}){
    const [user,setUser]= useState(null)
    const[loadingUser,setLoadingUser] = useState(true);
      const navigate = useNavigate();

    const checkSession = async()=>{
        try{
            const {data} = await api.get("/api/auth/me");
            setUser(data.user);
        }catch(error){
            setUser(null)
        }
        finally{
            setLoadingUser(false)
        }
    }
       useEffect(()=>{
        checkSession();
       },[checkSession])
         const login = async (email,password) =>{
            try{
                const{data}= await api.post("/api/auth/login",{email,password})
                setUser(data.user)
                toast.success("Login successful")
                navigate("/")

            }
            catch(error){
                 console.error("login failed",error);
                 const errMsg = error?.response?.data?.error||"invalid email or password";
                 toast.error(errMsg);
            }
         }
         

          const register = async (email,password,name) =>{
            try{
                const{data}= await api.post("/api/auth/register",{email,password,name})
                setUser(data.user)
                toast.success("Registration successful")
                navigate("/")

            }
            catch(error){
                 console.error("registration failed",error);
                 const errMsg = error?.response?.data?.error||"registration failed";
                 toast.error(errMsg);
                 throw new Error(errMsg);
            }
         }
    return (
        <AppContext.Provider value = {{
            user,
            loadingUser,
            login,
            register
        }}>
            {children}
        </AppContext.Provider>
    )
 }
 export function useAppContext(){
    const context = useContext(AppContext);
    if( context ===undefined){
        throw new Error('useAppContext must be used within a AppContextProvider')
    }
    return context;
 }