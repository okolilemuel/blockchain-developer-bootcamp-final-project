import { useEffect, useState } from "react"
import {ethers} from "ethers"

import getAsset from "../assets"
import bookingsABI from '../artifacts/abi.json'

export const formatAddress = (address: string) => `${address.substring(0, 3)}...${address.substring(address.length-3, address.length)}`

export default function Booking(){
    const [address, setAddress] = useState("")
    const [provider, setProvider] = useState(null)
    const [bookingsContract, setBookingsContract] = useState(null)
    const [page, setPage] = useState("0")
    const [owner, setOwner] = useState("")

    console.log(address, owner)

    useEffect(() => {
        (async () => {
            if(provider){
                const signer = provider.getSigner()
                const chainID = (await provider.getNetwork()).chainId;
                console.log(chainID)
                const assets = (await getAsset())[chainID as number]
                setAddress(await signer.getAddress())
                console.log(assets)
                const contract = new ethers.Contract(assets.booking, bookingsABI, signer)
                setBookingsContract(contract)
                const owner = await contract.owner()
                setOwner(owner)
            }
        })()
    }, [provider])

    return (
        <div className="relative flex flex-wrap items-center justify-center w-full h-screen text-white bg-gray-300">
            {address && <div className="absolute top-0 w-full text-center text-black">
                    <div className="text-4xl">Book A Room For Your Cat</div>
                    <div>You Address: {formatAddress(address)}</div>
                </div>}
            {
                address
                    ?  <RenderPage page={page} setPage={setPage} address={address} isOwner={address==owner} bookingsContract={bookingsContract} />
                    : <Connect setProvider={setProvider} />
            }
            
        </div>
    )
}

function Connect({setProvider}){

    const handleConnect = async () => {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        setProvider(provider)
    }
    
    return (
        <button className="p-4 bg-gray-800 rounded-2xl" onClick={handleConnect}>
            Connect Wallet to Start Booking
        </button>
    )
}


const renderOptions = {
    admin : {
        name: "adminMenu",
        options: {
            "0": "Owner's Home",
            "1": "Set room price",
            "2": "Withdraw",
        },
        components: {
            "0": () => <></>,
            "1": SetRoomPrice,
            "2": WithdrawEarnings,
        }
    },
    user : {
        name: "userMenu",
        options: {
            "0": "User's Home",
            "1": "New Booking",
            "2": "Extend Booking",
        },
        components: {
            "0": () => <></>,
            "1": NewBooking,
            "2": ExtendBooking,
        }
    }
}


function RenderPage({page, setPage, address, isOwner, bookingsContract}){
    const [price, setPrice] = useState(0)

    useEffect(() => {
        (async () => {
            if(bookingsContract){
                const price = await bookingsContract.getRoomPrice()
                setPrice(Number(price))
            }
            
        })()
    }, [bookingsContract])
    const renderOption = isOwner ? renderOptions.admin : renderOptions.user
    const Component = renderOption.components[page]
    return (
        <div className="text-black w-96 h-60">
            <div>Current Room Price: {price/10**18} ETH</div>
            <select value={page} onChange={(e) => setPage(e.target.value)} name={renderOption.name} id={renderOption.name}>
                {Object.keys(renderOption.options).map(opt => <option key={opt} value={opt}>{renderOption.options[opt]}</option>)}
            </select>
            <Component bookingsContract={bookingsContract} price={price} />
        </div>
    )
}

function SetRoomPrice({bookingsContract}){
    const [newPrice, setNewPrice] = useState("")
    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await bookingsContract.setRoomPrice(ethers.utils.parseEther(newPrice))
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <form className="w-full h-full mt-4" onSubmit={handleSubmit}>
            <label htmlFor="newPrice">New Room price</label>
            <input className="w-full h-10 pl-4 rounded-xl" id="newPrice" value={newPrice} onChange={e => setNewPrice(e.target.value)} placeholder="0.01" />
            <button className="w-full p-2 mt-6 text-white bg-gray-600 rounded-xl" type="submit">Set new price</button>
        </form>
    )
}

function WithdrawEarnings({bookingsContract}){
    const [earnings, setEarnings] = useState(0)

    const effect = async () => {
        const earnings = await bookingsContract.provider.getBalance(bookingsContract.address)
        setEarnings(Number(earnings))
    }
    useEffect(() => {
        effect()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await bookingsContract.withdraw()
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <form className="w-full h-full mt-4" onSubmit={handleSubmit}>
            <div>Earnings: {earnings/10**18} ETH</div>
            <button className="w-full p-2 mt-6 text-white bg-gray-600 rounded-xl" type="submit">Withdraw earnings</button>
        </form>
    )
}

function NewBooking({bookingsContract, price}){
    const [availableRooms, setAvailableRooms] = useState([])
    const [selected, setSelected] = useState("selectRoom")
    const [duration, setDuration] = useState("")

    console.log(selected, duration)

    const effect = async () => {
        let availableRooms = (await bookingsContract.getAvailableRooms()).map(a => Number(a))
        availableRooms = availableRooms.filter(a => a !== 0)
        console.log({availableRooms})
        setAvailableRooms(availableRooms)
    }

    useEffect(() => {
        effect()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const tx = await bookingsContract.createBooking(selected, duration, {value: (price * Number(duration)).toString()})
            await tx.wait()
            console.log(tx.hash)
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <form className="w-full h-full mt-4" onSubmit={handleSubmit}>
            <label htmlFor="selectRoom">Select a room</label>
            <select id="selectRoom" className="w-full h-10 pl-4 rounded-xl" onChange={e => setSelected(e.target.value)} value={selected}>
                <option value="selectRoom" disabled>Select room</option>
                {availableRooms.map((a) => <option key={a} value={String(a)}>Room {a}</option>)}
            </select>
            <label className="inline-block mt-2" htmlFor="roomDuration">Duration in days</label>
            <input className="w-full h-10 pl-4 rounded-xl" id="roomDuration" value={duration} onChange={e => setDuration(e.target.value)} placeholder="10" />
            <button className="w-full p-2 mt-6 text-white bg-gray-600 rounded-xl" type="submit">Book Room</button>
        </form>
    )
}

function ExtendBooking({bookingsContract, price}){
    const [roomID, setRoomID] = useState("")
    const [duration, setDuration] = useState("")


    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            await bookingsContract.extendBooking(roomID, duration, {value: (price * Number(duration)).toString()})
        } catch (error) {
            console.log(error)
        }
    }
    return (
        <form className="w-full h-full mt-4" onSubmit={handleSubmit}>
            <label className="inline-block mt-2" htmlFor="roomID">Room ID</label>
            <input className="w-full h-10 pl-4 rounded-xl" id="roomID" value={roomID} onChange={e => setRoomID(e.target.value)} placeholder="1" />
            <label className="inline-block mt-2" htmlFor="roomDuration">Duration in days</label>
            <input className="w-full h-10 pl-4 rounded-xl" id="roomDuration" value={duration} onChange={e => setDuration(e.target.value)} placeholder="10" />
            <button className="w-full p-2 mt-6 text-white bg-gray-600 rounded-xl" type="submit">Book Room</button>
        </form>
    )
}
