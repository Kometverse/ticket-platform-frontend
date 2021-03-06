import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo, Btn } from ".";
import { useAppContext } from "../_context";
import axios from "axios";
import { toast } from "react-hot-toast"

declare var window: any
const Navbar = () => {
    const [err, setErr] = useState<any>(null)
    const { isConnected, setIsConnected, orgnizerid,
        setorgnizerID, baseurl } = useAppContext()
    const [shortAccount, setShortAcount] = useState("")
    const [account, setAccount] = useState()
    const requrl = baseurl + "api/v1/market/v1/organiser/login"
    const checkWalletIsConnected = async () => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                const accounts = await ethereum.request({ method: "eth_accounts" });

                if (accounts.length !== 0) {
                    setAccount(accounts[0]);
                    setIsConnected(true);
                    console.log(accounts[0]);
                } else {
                    console.log("Do not have access");
                }
            } else {
                console.log("Install Metamask");
            }
        } catch (e) {
            console.log(e);
        }
    };


    const login = async () => {
        try {
            const { ethereum } = window;

            if (ethereum) {
                const accounts = await ethereum.request({
                    method: "eth_requestAccounts",
                });

                if (accounts.length !== 0) {
                    setAccount(accounts[0]);
                    setIsConnected(true);
                    console.log("Found");
                } else {
                    console.log("Not Found");
                }
            } else {
                toast.error('You dont have metamask install Metamask')

            }
        } catch (e) {
            console.log(e);
        }
    };

    const changeNetwork = async (chainId: string) => {
        try {
            const { ethereum } = window;
            if (ethereum) {
                if (chainId !== '0x89') {
                    toast.error('Connect to Polygon Mainnet')
                    await ethereum.request({
                        method: "wallet_switchEthereumChain",
                        params: [{ chainId: "0x89" }],
                    });
                }
            } else {
                console.log("Ethereum not found!");
            }
        } catch (e) {
            console.log(e);
        }
    };

    const createOrgnizer = async () => {
        const res = await axios.post(requrl,
            {
                "publicAddress": account
            }
        )
        const data = res.data.organiserId;
        setorgnizerID(data)
    }
    useEffect(() => {
        checkWalletIsConnected()
        try {
            let { ethereum }: any = window
            ethereum.on('chainChanged', (chainId: string) => {
                changeNetwork(chainId)
            })
        } catch (err) {
            setErr(err)
            toast.error('You dont have metamask install Metamask')
        }
    }, [])


    useEffect(() => {
        let acc = String(account)
        acc = acc.slice(0, 7)
        setShortAcount(acc)
        if (account) {
            createOrgnizer()
            console.log("orgs")
        }

    }, [account])


    return (
        <>
            <nav className="flex justify-between items-center text-white">
                <div className="w-20">
                    <Logo />
                </div>
                <div className="lg:flex hidden items-center ">
                    {isConnected ? <Link href="/CreateCollection" >
                        <a className="mx-5 border-purple-800 border px-4 py-2 rounded-2xl" href="">Create Event</a>
                    </Link> : null}
                    {isConnected ? <Btn text={shortAccount ? shortAccount : ""} onclick={() => { }} /> : <Btn text="Connect wallet" onclick={login} />}
                </div>
            </nav>
        </>
    )
}


export default Navbar;