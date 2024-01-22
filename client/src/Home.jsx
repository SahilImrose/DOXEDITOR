import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import './Home.css'
import AuthContext from './context/AuthContext'
import { useHistory } from 'react-router'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.min.css';
import DocListItem from './components/DocListItem/DocListItem'
import PizZip from "pizzip";
import { DOMParser } from "@xmldom/xmldom";

function str2xml(str) {
    if (str.charCodeAt(0) === 65279) {
      // BOM sequence
      str = str.substr(1);
    }
    return new DOMParser().parseFromString(str, "text/xml");
  }
  
  // Get paragraphs as javascript array
  function getParagraphs(content) {
    const zip = new PizZip(content);
    const xml = str2xml(zip.files["word/document.xml"].asText());
    const paragraphsXml = xml.getElementsByTagName("w:p");
    const paragraphs = [];
  
    for (let i = 0, len = paragraphsXml.length; i < len; i++) {
      let fullText = "";
      const textsXml = paragraphsXml[i].getElementsByTagName("w:t");
      for (let j = 0, len2 = textsXml.length; j < len2; j++) {
        const textXml = textsXml[j];
        if (textXml.childNodes) {
          fullText += textXml.childNodes[0].nodeValue;
        }
      }
      if (fullText) {
        paragraphs.push(fullText);
      }
    }
    return paragraphs;
  }

const Home = (props) => {
    const [title, setTitle] = useState("")
    const [docs, setDocs] = useState([])
    const [errorMessage, setErrorMessage] = useState("")

    const [loading, setLoading] = useState(true)

    const { currentUser } = useContext(AuthContext)

    const history = useHistory()
    const [paragraphs, setParagraphs] = useState(null);



    if(paragraphs != null)  localStorage.setItem('paragraphs',paragraphs)
    
     const onFileUpload= async (event) => {
       const reader = new FileReader();
       let file = event.target.files[0];
       localStorage.setItem("title",file.name)
   
       reader.onload = (e) => {
         const content = e.target.result;
         const paragraphs = getParagraphs(content);
         setParagraphs(paragraphs);
       };
   
       reader.onerror = (err) => console.error(err);
   
       reader.readAsBinaryString(file);
       async function createNewDoc() {
        try {
            const newDoc = await axios.post('https://docxserver.onrender.com/api/docs', {
                name: `${localStorage.getItem("title")}`
            }, { withCredentials: true })

            const docId = newDoc.data.data.doc._id
            return docId
        } catch (err) {
            setErrorMessage(err.response.data.message)
        }
    }





    const docId = await createNewDoc()

    if (docId) {
        const docIdString = `id=${docId}`

        props.history.push({
            pathname: "/new",
            search: docIdString,
        })
    }
     };
   




    const clickHandler = async () => {
        async function createNewDoc() {
            try {
                const newDoc = await axios.post('https://docxserver.onrender.com/api/docs', {
                    name: title
                }, { withCredentials: true })

                const docId = newDoc.data.data.doc._id
                return docId
            } catch (err) {
                setErrorMessage(err.response.data.message)
            }
        }





        const docId = await createNewDoc()

        if (docId) {
            const docIdString = `id=${docId}`

            props.history.push({
                pathname: "/new",
                search: docIdString,
            })
        }
    }

    async function getAllDocs() {
        const docs = await axios.get('https://docxserver.onrender.com/api/docs')

        setDocs(docs.data.data.docs)
        setLoading(false)
    }

    useEffect(() => {
        getAllDocs()
    }, [])

    const viewDocHandler = (id) => {
        const idString = `id=${id}`

        props.history.push({
            pathname: '/view',
            search: idString,
        })
    }

    const deleteDocHandler = async (id) => {
        try {
            await axios.delete(`https://docxserver.onrender.com/api/docs/${id}`)

            // props.history.push({
            //     pathname: "/delete"
            // })

            getAllDocs()

            toast.error("Document Deleted!", {
                position: toast.POSITION.TOP_LEFT,
                autoClose: 2000
            })

        } catch (err) {
            console.log(err)
        }
    }

    const manageDocumentHandler = (id, title, collaborators) => {
        history.push({
            pathname: '/manage',
            state: {
                id,
                title,
                collaborators
            }
        })

    }

    return (
        <>

            {
                loading === true
                    ? <div className="medium progress"><div>Loading…</div></div>
                    : null
            }

            {
                loading === false ? (
                    <div className="dashboard-container" >

                        <div className="new-doc-card" >

                            <div className="add-new-doc" >
                                <span className="add-btn" disabled >
                                    <span className="material-icons" >
                                        add
                                    </span>
                                </span>

                                <h3 className="heading-secondary" >Add new document</h3>
                            </div>

                            <form className="add-new-doc-form" >

                                <div style={{ display: "flex" }} >
                                    <label className="doc-title" >Title </label>

                                    {
                                        errorMessage !== "" && <div className="error-box-home" > <p className="error-text-home" > {errorMessage} </p> </div>
                                    }

                                </div>
                                    <input type="file" onChange={onFileUpload} name="docx-reader" style={{margin:"10px 0px"}} />

                                <input
                                    type="text"
                                    placeholder="Enter title of the document"
                                    onChange={(e) => {
                                        setTitle(e.target.value)
                                    }}
                                    className="doc-title-input"
                                />

                                <button
                                    type="submit"
                                    onClick={
                                        (e) => {
                                            e.preventDefault()
                                            clickHandler()
                                        }
                                    }
                                    disabled={!title}
                                    className="add-new-doc-btn"
                                >
                                    Add
                                </button>
                            </form>
                        </div>
                    </div>

                )
                    : null
            }

            {
                loading === false ?
                    (
                        <div className="docs-card" >
                            <div className="saved-docs-div" >
                                <span className="material-icons  saved-icon" >
                                    save
                                </span>
                                <h3 className="heading-secondary" >Saved Documents</h3>
                            </div>

                            {
                                docs.map((doc, index) => {
                                    return (
                                        <DocListItem 
                                            key={index} 
                                            doc={doc} 
                                            currentUser={currentUser}
                                            viewDocHandler={viewDocHandler}
                                            manageDocumentHandler={manageDocumentHandler}
                                            deleteDocHandler={deleteDocHandler}
                                        />
                                    )
                                })
                            }

                        </div>
                    )
                    : null
            }
        </>
    )
}


  
  
  
  
export default Home;