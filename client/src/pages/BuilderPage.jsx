import React, { useEffect, useState } from 'react'
import { useAppContext } from '../context/AppContext'
import { useNavigate,useParams } from 'react-router-dom'
import Loading from '../components/Loading'
import BuilderHeader from '../components/BuilderHeader'
import { FolderTreeIcon, MessageSquareIcon } from 'lucide-react'
import ChatPanel from '../components/ChatPanel'
import FileExplorer from '../components/FileExplorer'
import PreviewPanel from '../components/PreviewPanel'
import AgentProgressDashboard from '../components/AgentProgressDashboard'
import Publishmodel from '../components/Publishmodel'
import { exportProjectZip } from '../utils/exportProject'
import api from '../api/api'
import toast from 'react-hot-toast'


const BuilderPage = () => {
    const{id} =useParams()
    const navigate = useNavigate()
    const[leftTab,setLeftTab] = useState('chat');
    const[publishing,setPublishing]=useState(false);
     const[publishUrl,setPublishUrl]=useState(null);
      
    const{activeproject,loadingActiveproject,activeFile,showCode,setActiveFile,user,setshowCode,loadProject,logout,chatLoading,handleChat}=useAppContext();
     
    useEffect(()=>{
        if(!id)return;
        loadProject(id)
    },[id])
     
    
    
    const handleOpenPreview=()=>{
        if(!id)return;
        window.open(`/preview/${id}`,"_blank")
    }
    const handlePublish = async()=>{
if(!id)return;
setPublishing(true)
try{
    await api.post(`/api/projects/${id}/publish`);
    const url = `${window.location.origin}/publish/${id}`;
    setPublishUrl(url)
    toast.success('website published successfully')
}catch(error){
    console.error('Publish failed:',error)
    toast.error(error?.response?.data.error||'Publish failed');

}finally{
    setPublishing(false)
}
    }
    const handleDownload = async()=>{
            if (!activeproject)return;
            exportProjectZip(activeproject)
    }
    if(loadingActiveproject||!activeproject){
        return<Loading/>
    }
   
  return (
    <div className='h-screen flex flex-col bg-white overflow-hidden text-zinc-900 relative'>
    <BuilderHeader
    projectName={activeproject.name}
    version = {activeproject.version}
    showCode={showCode}
    publishing={publishing }
    onToggleShowCode={()=>setshowCode(!showCode)}
    onOpenPreview={handleOpenPreview} 
    onPublish={handlePublish}
    onDownload={handleDownload}
    onBack={()=>navigate("/")}
    onLogout={logout}
    />
    {/* main layout*/}
    <div className='flex-1 flex overflow-hidden'>
       {/*left*/}
       <div className='w-[320px] shrink-0 flex flex-col border-r border-zinc-200 bg-white'>
        {/*sidebar*/}
        <div className='flex border-b border-zinc-100'>
            <button onClick={()=>setLeftTab("chat")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer${leftTab==="chat"?"text-zinc-900 border-b-2 border-zinc-900":"text-zinc-400 hover:text-zinc-700"}`}  >
                < MessageSquareIcon size={13}/>
                Chat
            </button>
             <button onClick={()=>setLeftTab("files")}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium cursor-pointer${leftTab==="files"?"text-zinc-900 border-b-2 border-zinc-900":"text-zinc-400 hover:text-zinc-700"}`}  >
                < FolderTreeIcon size={13}/>
                Files
            </button>
        </div>
        {/*sidebsr*/}
        <div className='flex-1 overflow-hidden'>
            {
                leftTab ==='chat'?(
                    <ChatPanel messages ={activeproject.messages} onSend ={handleChat} loading ={chatLoading}/>
                ):(
                    <FileExplorer files ={activeproject.files} activeFile = {activeFile}
                    onFileSelect ={(path)=>{
                        setActiveFile(path)
                        setshowCode(true);
                    }}/>
                )
            }

        </div>
       </div>
       {/*preview*/}
       <div className='flex-1 overflow-hidden'>
             {activeproject.status ==="pending"||activeproject.status ==="generating"||activeproject.status==="Failed"?(
                 <AgentProgressDashboard project={activeproject} />
             ):(
                <PreviewPanel project ={activeproject} activeFile={activeFile}  showCode={showCode}/>
             )}
       </div>
    </div>
    {publishUrl &&<Publishmodel publishUrl = {publishUrl}onClose={()=>setPublishUrl(null)}/>}
    </div> 
  )
}

export default BuilderPage