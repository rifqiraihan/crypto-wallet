import { useState, useEffect } from "react"
import { Button, Card, CardContent, Typography, IconButton } from "@mui/material"
import { AccountBalanceWallet, PowerSettingsNew, AttachMoney } from "@mui/icons-material"
import Web3 from "web3"
import axios from "axios"

export default function ConnectWallet() {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [prices, setPrices] = useState<{ name: string; price: number }[]>([])

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      const web3 = new Web3((window as any).ethereum)
      try {
        await (window as any).ethereum.request({ method: "eth_requestAccounts" })
        const accounts = await web3.eth.getAccounts()
        setAccount(accounts[0])
        const weiBalance = await web3.eth.getBalance(accounts[0])
        setBalance(web3.utils.fromWei(weiBalance, "ether"))
      } catch (error) {
        console.error("Error connecting wallet:", error)
      }
    } else {
      alert("MetaMask not detected! Please install MetaMask and refresh.")
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setBalance(null)
  }

  const fetchCryptoPrices = async () => {
    try {
      const response = await axios.get(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,ripple,cardano,solana&vs_currencies=usd"
      )
      const data = response.data
      setPrices([
        { name: "Bitcoin", price: data.bitcoin.usd },
        { name: "Ethereum", price: data.ethereum.usd },
        { name: "Ripple", price: data.ripple.usd },
        { name: "Cardano", price: data.cardano.usd },
        { name: "Solana", price: data.solana.usd },
      ])
    } catch (error) {
      console.error("Error fetching crypto prices:", error)
    }
  }

  useEffect(() => {
    fetchCryptoPrices()
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-5">
      <div className="w-full max-w-lg">
        <Card className="bg-gray-800 text-white p-4 shadow-lg">
          <CardContent className="flex flex-col items-center space-y-4">
            <AccountBalanceWallet fontSize="large" className="text-blue-500" />
            <Typography variant="h5" className="font-bold">
              {account ? "Wallet Connected" : "Connect Your Wallet"}
            </Typography>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={connectWallet} 
              fullWidth
            >
              {account ? "Connected" : "Connect Wallet"}
            </Button>
            {account && (
              <IconButton onClick={disconnectWallet} className="text-red-500">
                <PowerSettingsNew />
              </IconButton>
            )}
          </CardContent>
        </Card>

        {account && (
          <Card className="bg-gray-800 text-white p-4 mt-4 shadow-lg">
            <CardContent className="space-y-3">
              <Typography variant="h6" className="font-bold">Wallet Details</Typography>
              <Typography variant="body1">Address: {account}</Typography>
              <Typography variant="body1">Balance: {balance} ETH</Typography>
            </CardContent>
          </Card>
        )}

        <Card className="bg-gray-800 text-white p-4 mt-4 shadow-lg">
          <CardContent>
            <Typography variant="h6" className="font-bold flex items-center">
              <AttachMoney className="mr-2 text-green-500" /> Crypto Prices
            </Typography>
            <div className="space-y-2 mt-2">
              {prices.map((crypto, index) => (
                <Typography key={index} variant="body1">
                  {crypto.name}: ${crypto.price}
                </Typography>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
