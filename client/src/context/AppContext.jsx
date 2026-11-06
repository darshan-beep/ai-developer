import{createContext, useState,useEffect, useCallback} from 'react'
import { useContext } from 'react'
import api from '../api/api'
import {toast} from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'
import debounce from 'lodash.debounce'
import React from 'react'



const AppContext = createContext(undefined)
 export function AppContextProvider({children}){
    const [user,setUser]= useState(null)
    const[loadingUser,setLoadingUser] = useState(true);
      const navigate = useNavigate();
    const[projects,setProjects]=useState({});
    const[loadingprojects,setLoadingProjects]=useState(true);
    const[activeproject,setActiveProject]=useState(null);
     const[loadingActiveproject,setloadingActiveProject]=useState(true);
     const[chatLoading,setChatLoading]=useState(false);
      const[generatingProject,setGeneratingProject]=useState(false);
      const[activeFile,setActiveFile]=useState('/App.js');
        const[showCode,setshowCode]=useState(false);

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
       },[])
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
         

          const register = async (name,email,password) =>{
            try{
                const{data}= await api.post("/api/auth/register",{name,email,password,})
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
         const logout= async()=>{
            try{
                await api/post("/api/auth/logout")
                setUser(null)
                setProjects([])
                setActiveProject(null)
                toast.success("logout sucessfully")
                navigate("/login")
            }
            catch(error){
                console.error("Logout Failed:",error)
                 toast.error("logout failed")    
            }

         }
         const loadProjects = async()=>{
            if(!user)return;
            try{
                const{data}= await api.get("/api/projects")
                setProjects(data)
            }
            catch(error){
                console.error("failed to list projects:",error)

            }finally{
                setLoadingProjects(false)
            }
         }
         const loadProject =async(id,silent = false)=>{
            if(!user)return;
            if(!silent)setloadingActiveProject(true)
                try{
                const{data}=await api.get(`/api/projects/${id}`)
                setActiveProject(data)
                const files = Object.keys(data.files);
                if(files.length>0){
                    setActiveFile((prev)=>{
                        if(files.includes(prev)) return prev;
                        if(files.includes("/App.js")) return"/App.js";
                        return files[0]
                    })
                }
            }
            catch(error){
            console.error("failed to load project:",error)
             if(!silent){
                toast.error("failed to load project details");
                navigate("/")
             }
            }finally{
                if(!silent)setloadingActiveProject(false)

            }

         }
         useEffect(()=>{
            if(!activeproject?._id||!user)return;
            const isOngoing = activeproject.status==="generating"||activeproject.status==="pending"||activeproject.status==="revising"
            if(isOngoing){
                setChatLoading(true)
                const interval= setInterval(()=>{
                loadProject(activeproject._id,true)
                },2000)
            }
         },[activeproject?.id,activeproject?.status,loadProject,user])

         const handleGenerate = useCallback(
            async(prompt)=>{
                if(!user)return;
                setGeneratingProject(true);
                try{
                    const{data}=await api.post("/api/projects",{prompt})
                    toast.success("AI Agent is planning structure....")
                    navigate(`/builder/${data._id}`);
                }catch(error){
                         console.error("Failed to generate projects:",err);
                         toast.error(err?.response?.data?.error||"failed to generate project")
                }  finally{
                    setGeneratingProject(false);
                }             

            },[navigate,user]
         )
         const handleDelete = useCallback(
            async(id)=>{
                if(!user)return;
                setGeneratingProject(true);
                try{
                    const{data}=await api.delete(`/api/projects/${id}`)
                    setProjects((prev)=>prev.filter((p)=>p._id!==id))
                    toast.success("project deleted sucessfully")
                
                }catch(error){
                         console.error("Failed to delete project:");
                         toast.error("failed to delete project")
                }               

            },[user]
         )
         const handleChat = useCallback(
            async(prompt)=>{
               if(!activeproject||!user)return;
               setChatLoading(true)
               try{
                const{data }= await api.post(`/api/projects/${activeproject._id}/chat`,{prompt})
                 setActiveProject(dats)
                if(data.errors&&data.errors.length >0){
                    toast.error(`${data.errors.length} revision patch(es) failed`)
                }else{
                    toast.success(`updated to version${data.version}`)
                }
            
            }catch(error){
               console.error ("revision request faileed",error);
               toast.error(error?.response?.data?.error||"revision request failed")
                
               }finally{
                setChatLoading(false)
               }
            },[activeproject,user]
         )
         const debouncedSave = React.useMemo(
            ()=>debounce(async(files,id)=>{
                try{
                    await api.put(`/api/projects/${id}/files`,{files})

                }catch(error){
                    console.error("failed to auto-save files",error)
                    toast.error("failed to save code modifications")

                }
            },1000),[],
         )
         useEffect(()=>{
            return()=>{
                debouncedSave.flush();
            }
         },[debouncedSave])
         const updateProjectFiles = useCallback(
            async(params)=>{
             if (!activeproject||!user)return;
             debouncedSave(files,activeproject._id)

            },[activeproject,user,debouncedSave]
        )
    return (
        <AppContext.Provider value = {{
            user,
            loadingUser,
            login,
            register,
            projects,
            loadingprojects,
            activeproject,
            loadingActiveproject,
            chatLoading,
            generatingProject,
            activeFile,
            showCode,
            setActiveFile,
            setshowCode,
            loadProjects,
            loadProject,
            handleGenerate,
            handleDelete,
            logout,
            updateProjectFiles,
            handleChat


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