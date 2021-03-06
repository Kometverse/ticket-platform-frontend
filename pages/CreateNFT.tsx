import FormData from 'form-data'
import { useEffect, useState } from 'react'
import { useAppContext } from './_context'
import axios from 'axios'
import { ethers } from 'ethers'
import contractABI from '../contracts/abi.json'
import Modal from './Components/LoadingModal'
import Input from './Components/Forms/Input'
import { create } from 'ipfs-http-client'
const contractAddress = '0x82a6F5126bfE1d954aEe84c3B68858Dcc5e255B6'

declare var window: any
export default function CreateNFT() {
    const {
        isConnected,
        noOfTokens,
        setNoOfTokens,
        baseurl,
        orgnizerid,
        collectionAdress,
        setCollectionAdress,
        collectionName,
        collectionPrice,
        collectionSymbol,
        eventDate,
        eventPlace,
        saleEndDate,
        orgnizerName,
        collectionID,
        setCollectionID,
        step,
        setStep,
        showModal,
        setShowModal,
        createStatus,
        setCreateStatus,
    } = useAppContext()

    // const client = create({url: "https://ipfs.infura.io:5001/api/v0"});  

    const [preview, setPreview] = useState<any>()
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [imageUrl, setImageUrl] = useState('')
    const requrl = baseurl + 'api/v1/market/v1/token/upload_symbol'
    const [selectedFile, setSelectedFile] = useState<any>(null)
    const [loading, setloading] = useState(false)
    
    const CreateCollection = async () => {
        try {
            const { ethereum } = window
            if (ethereum) {
                const provider = new ethers.providers.Web3Provider(ethereum)
                const signer = provider.getSigner()
                const newCollectionContract = new ethers.Contract(
                    contractAddress,
                    contractABI,
                    signer
                )
                let newCollectionTxn = await newCollectionContract.deployNftCollection(
                    collectionName,
                    collectionSymbol,
                    baseurl,
                    ethers.utils.parseEther(`${collectionPrice}`)
                )
                newCollectionTxn.hash
                newCollectionTxn.wait()
                newCollectionContract.on(
                    'CollectionCreated',
                    (nftAddress: any, _organiserId) => {
                        setCollectionAdress(nftAddress)
                    }
                )
            } else {
                console.log("Ethereum object doesn't exist!")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const createNFt = async () => {
        const data = new FormData()
        data.append('file', selectedFile, selectedFile.name)
        try {
            const res = await axios.post(requrl, data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            })

            console.log(res)
            if (res.data.status) {
                console.log(collectionID)
                console.log('image uploaded')
                console.log(res.data.url)
                const myres = await axios.post(
                    baseurl + 'api/v1/market/v1/token/create',
                    {
                        numberOfTokens: noOfTokens,
                        collectionId: collectionID,
                        attributes: {
                            name: name,
                            decimals: 10,
                            description: description,
                            image: res.data.url,
                        },
                        mediaUrl: res.data.url,
                    }
                )
                console.log(myres.data)
                setCreateStatus(res.data.status)
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleFileSelect = async(e: any) => {
        setSelectedFile(e.target.files[0])

        // const addFile = await client.add(e.target.files[0], {
        //     progress: (prog) => console.log(`Received: ${prog}`)
        // });

        // const url = `https://ipfs.infura.io/ipfs/${addFile.path}`;
        // console.log("Url:", url);
        // setImageUrl(url);
    }

    const handleSubmit = async (e: any) => {
        e.preventDefault()
        setloading(true)
        setShowModal(true)
        setStep(step + 1)
        CreateCollection()
    }
    useEffect(() => {
        return () => {
            setShowModal(false)
        }
    }, [])

    useEffect(() => {
        (async () => {
            const requrl = baseurl + '/api/v1/market/v1/collections/create'
            if (collectionAdress) {
                console.log(collectionAdress)
                const res = await axios.post(requrl, {
                    organiserId: orgnizerid,
                    organiserName: orgnizerName,
                    collectionName: collectionName,
                    collectionPrice: collectionPrice,
                    collectionContractId: collectionAdress,
                    nftCollection: true,
                    collectionSymbol: collectionSymbol
                })
                console.log(res.data.collectionId)
                setCollectionID(res.data.collectionId)
            }
            console.log(orgnizerid)
        })()
    }, [collectionAdress])

    useEffect(() => {
        console.log(selectedFile)
        if (!selectedFile) {
            setPreview(undefined)
            return
        }
        const objectUrl = URL.createObjectURL(selectedFile)
        setPreview(objectUrl)
        console.log(objectUrl);
        return () => URL.revokeObjectURL(objectUrl)
    }, [selectedFile])

    useEffect(() => {
        if (collectionID) {
            createNFt()
        }
    }, [collectionID])

    return (
        <>
            <div className="flex min-h-[90vh] w-full flex-col justify-center text-opacity-80 lg:w-[50%]">
                <div className="py-10">
                    <h1 className="text-4xl">Add NFTs to Collection </h1>
                    <div className="my-8">
                        <form className="flex w-full flex-col  " onSubmit={handleSubmit}>
                            <div>
                                <label htmlFor="name">Name</label>
                                <p className="text-[10px] text-gray-300">
                                    name will be on each ticket{' '}
                                </p>
                                <Input
                                    id="name"
                                    name="name"
                                    type="text"
                                    value={name}
                                    setValue={setName}
                                    placeholder={'Prime pass'}
                                />
                            </div>

                            <div className="my-8">
                                <label htmlFor="collection name" className="">
                                    Number of tickets
                                </label>
                                <p className="text-[10px] text-gray-300">
                                    volume of tickets in number{' '}
                                </p>
                                <Input
                                    id="collection name"
                                    name="collection name"
                                    type="number"
                                    value={noOfTokens}
                                    setValue={setNoOfTokens}
                                    placeholder={''}
                                />
                            </div>
                            <div className="">
                                <label htmlFor="description" className="">
                                    Description
                                </label>
                                <p className="text-[10px] text-gray-300">
                                    The description will be included on the item's detail page{' '}
                                </p>
                                <textarea
                                    value={description}
                                    onChange={(e) => {
                                        setDescription(e.target.value)
                                    }}
                                    id="description"
                                    name="desccription"
                                    required={true}
                                    placeholder="Add  description"
                                    className="my-2 min-h-[300px] w-full border border-gray-500 bg-transparent px-3  py-2 focus:outline-none"
                                />
                            </div>

                            <div className="my-8">
                                <div>
                                    <label className="mb-2 inline-block">Image</label>
                                    <p>File types supported: JPG, PNG, GIF, SVG</p>
                                </div>
                                <div className="my-2 flex w-full items-center justify-center ">
                                    <label className="hover:border-purple-700-300 flex w-full flex-col border-2 border-gray-500  after:hidden hover:bg-gray-700">
                                        <div className="flex min-h-[400px] cursor-pointer items-center justify-center">
                                            {selectedFile ? (
                                                <img className="object-cover" src={preview} alt="" />
                                            ) : (
                                                <div className="flex flex-col items-center justify-center">
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-12 w-12 text-gray-400 group-hover:text-gray-600"
                                                        viewBox="0 0 20 20"
                                                        fill="currentColor"
                                                    >
                                                        <path
                                                            fillRule="evenodd"
                                                            d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                                                            clipRule="evenodd"
                                                        />
                                                    </svg>
                                                    <p className="pt-1 text-sm tracking-wider text-gray-400 group-hover:text-gray-600">
                                                        Select a photo
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        <input
                                            type="file"
                                            className="absolute opacity-0  "
                                            onChange={handleFileSelect}
                                        />
                                    </label>
                                </div>
                            </div>
                            <div>
                                {loading ? (
                                    <button
                                        className="cursor-not-allowed rounded-3xl bg-purple-700 px-5 py-2 opacity-50"
                                        disabled
                                    >
                                        submit
                                    </button>
                                ) : (
                                    <input
                                        type="submit"
                                        className="cursor-pointer rounded-3xl bg-purple-700 px-5 py-2"
                                    />
                                )}
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <Modal />
        </>
    )
}
