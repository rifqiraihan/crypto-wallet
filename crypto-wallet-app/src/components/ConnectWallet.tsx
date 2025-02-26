import { useState, useEffect } from "react"
import { Button, Card, CardContent, Typography, Accordion, AccordionSummary, AccordionDetails, Skeleton } from "@mui/material"
import { AttachMoney, ExpandMore, Info, Login, Logout } from "@mui/icons-material"
import Web3 from "web3"
import axios from "axios"

interface CryptoPrice {
  name: string
  symbol: string
  price: number
  change: number
}


export default function ConnectWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [prices, setPrices] = useState<CryptoPrice[]>([])
  const [loadingPrice, setLoadingPrice] = useState<boolean>(true)
  const [loadingAccount, setLoadingAccount] = useState<boolean>(false)



  const connectWallet = async () => {
    setLoadingAccount(true)
    if ((window as any).ethereum) {
      const web3 = new Web3((window as any).ethereum)
      try {
        await (window as any).ethereum.request({ method: "eth_requestAccounts" })
        const accounts = await web3.eth.getAccounts()
        setLoadingAccount(false)
        setAccount(accounts[0])
        const weiBalance = await web3.eth.getBalance(accounts[0])
        setBalance(web3.utils.fromWei(weiBalance, "ether"))
      } catch (error) {
        console.error("Error connecting wallet:", error)
        setLoadingAccount(false)
      }
    } else {
      alert("MetaMask not detected! Please install MetaMask and refresh.")
      setLoadingAccount(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setBalance(null)
  }

  const fetchCryptoPrices = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/coins/markets",
        {
          params: {
            vs_currency: "usd",
            ids: "bitcoin,ethereum,ripple,cardano,solana",
            order: "market_cap_desc",
            per_page: 5,
            page: 1,
            sparkline: false,
          },
        }
      )
      setPrices(
        response.data.map((coin: any) => ({
          name: coin.name,
          symbol: coin.symbol.toUpperCase(),
          price: coin.current_price,
          change: coin.price_change_percentage_24h,
        }))
      )
      setLoadingPrice(false)
    } catch (error) {
      console.error("Error fetching crypto prices:", error)
      setLoadingPrice(false)
    }
  }
  

  useEffect(() => {
    fetchCryptoPrices()
  }, [])

  return (
    <div className="flex flex-col w-full justify-center items-center min-h-screen bg-gray-900 text-white p-5">
      <div className="w-full md:w-3/4 ">
      <Card className="!bg-gray-800 text-white p-4 shadow-lg !rounded-lg">
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="flex gap-2 items-center">
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg" 
            alt="MetaMask Logo" 
            className="w-12 h-12"
          />
          
          <Typography  className="!font-bold !text-2xl text-white">
            {account ? "Wallet Connected" : "Metamask Wallet"}
          </Typography>
          </div>
          
          {account? (
            <Button 
            variant="contained" 
            color="primary" 
            onClick={disconnectWallet} 
            className="w-full md:w-1/3 !text-base text-white "
            startIcon={<Logout />}
          >
            Disconnect Wallet
          </Button>
          ):(
            <Button 
            variant="contained" 
            color="primary" 
            onClick={connectWallet} 
            className="w-full md:w-1/3 !text-base text-white "
            startIcon={<Login />}
          >
            {loadingAccount ? 'Loading . . .' : 'Connect Wallet' }
          </Button>
          )}
          
        </CardContent>
      </Card>


        {account && (
         <Accordion
           defaultExpanded
           className="!bg-gray-800 text-white p-4 mt-4 shadow-xl !rounded-lg"
         >
           <AccordionSummary
            expandIcon={<ExpandMore className="text-white" />}
            aria-controls="panel1-content"
            id="panel1-header"
            className="shadow-lg"
  
           >
             <Typography className="!font-bold !text-2xl flex items-center text-white">
              <Info className="mr-2 text-yellow-500 " fontSize="large" /> 
              Wallet Details
            </Typography>
           </AccordionSummary>
           <AccordionDetails >
            {loadingAccount ? (
              <Skeleton width={"100%"} height={250} className='!rounded-lg'/>
            ):(
            <div className="mt-4 text-left">
              <div className="flex flex-col md:flex-row gap-1 md:gap-3 mb-2">
                <Typography className="!font-bold text-white !text-xl break-all">
                  Address: 
                </Typography>
                <Typography className="!font-bold text-blue-400  !text-xl break-all">
                 {account ?? '-'}
                </Typography>
              </div>
              <div className="flex flex-col md:flex-row gap-1 md:gap-3">
                <Typography className="!font-bold text-white !text-xl break-all">
                  Balance: 
                </Typography>
                <Typography className="!font-bold text-blue-400  !text-xl break-all">
                 {balance ?? '-'} ETH
                </Typography>
              </div>
             </div>
             )}
           </AccordionDetails>
         </Accordion>
        )}

        <Card className="!bg-gray-800 text-white p-4 mt-4 shadow-lg !rounded-lg">
          <CardContent>
            <Typography className="!font-bold !text-2xl flex items-center text-white">
              <AttachMoney className="mr-2 text-green-500" fontSize="large" /> 
              Crypto Prices
            </Typography>
            {loadingPrice ? (
              <Skeleton width={"100%"} height={400} className='!rounded-lg'/>
            ):(
              prices.length > 0 ? (
            <div className="space-y-4 mt-4">
              {prices.map((crypto, index) => {
                const isNegative = crypto.change < 0
                return (
                  <div key={index} className="bg-white flex items-center p-3 rounded-lg shadow">
                    <img
                       src={`https://raw.githubusercontent.com/spothq/cryptocurrency-icons/master/128/color/${crypto.symbol.toLowerCase()}.png`}
                      alt={crypto.name}
                      className="w-10 h-10 mr-3"
                    />

                    <div className="flex flex-col text-left">
                      <Typography  className="text-blue-400 !font-semibold">
                        {crypto.name} ({crypto.symbol})
                      </Typography>

                      <div className="flex gap-1 items-center">
                        <Typography variant="h6" fontWeight='bold' className="font-bold">
                          {new Intl.NumberFormat().format(crypto.price)}
                        </Typography>
                        <Typography className="!text-sm">USD</Typography>
                        <Typography
                          variant="body2"
                          className={`ml-2 ${isNegative ? "text-red-500" : "text-green-500"}`}
                        >
                          ({crypto.change.toFixed(2)}%)
                        </Typography>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
              ):(
                <Typography className="!font-bold !text-2xl text-center my-8 text-white">No Data Available</Typography>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
