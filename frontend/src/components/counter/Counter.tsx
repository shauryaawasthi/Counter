import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import { useRecoilValue } from "recoil";
import { CosmWasmClient } from "@cosmjs/cosmwasm-stargate";
import { contractAddress } from '../../contracts/contactAddress';
// import { SigningCosmWasmClient } from '@cosmjs/cosmwasm-stargate';
import { API_URL } from '../../constants/constants';
import { walletState } from "../../utils/walletState";
import { confirmAlert } from 'react-confirm-alert';
import { useConnectWallet } from '../../hooks/useConnectwallet';
import './Counter.css';
import 'react-confirm-alert/src/react-confirm-alert.css'; // Import css
import { chainInfo } from '../../utils/chainInfo';

const Counter = () => {
    const { address, client, balance } = useRecoilValue(walletState);
    const [isLoading, setIsLoading] = useState(false);
    const [counterValue, setCounterValue] = useState(0);
    const [currWallet, setCurrWallet] = useState(null);
    const connectWallet = useConnectWallet();
    // let queryClient:any;

    useEffect(()=>{
        // const getClient = async()=>{
        //     queryClient = await CosmWasmClient.connect(API_URL);
        // }
        // getClient();
        // connectWallet();
        getCount();
        console.log(address);
        
    },[address]);
    const chainId = 'uni-3'
    const connectKeplr = async() => {
        if((window as any).keplr){
            await (window as any).keplr.enable(chainId)
            const offlineSigner = (window as any).keplr.getOfflineSigner(chainId);
        const data = await offlineSigner.getAccounts();
        console.log("dta", data);
        setCurrWallet(data[0].address)
        }
        else{
            console.log("keplr not installed");
        }
    }
    const connectLeap = async() => {
        if((window as any).leap){
            await (window as any).leap.enable(chainId)
            const offlineSigner = (window as any).keplr.getOfflineSigner(chainId);
            const data = await offlineSigner.getAccounts();
            console.log("dta", data);
        }
        else{
            console.log("leap not installed");
        }
    }

    const connectMetamask = async() => {
        if((window as any).ethereum){
            const data = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
            console.log("data from metamask", data);
            setCurrWallet(data[0]);
        }
        else{
            console.log("metamask not installed")
        }
    }
    const modal = () => {
        confirmAlert({
          title: 'Select any one option',
        //   message: 'Test',
          buttons: [
            {
              label: 'Keplr',
              onClick: () => {connectKeplr()}
            },
            {
              label: 'Leap Wallet',
              onClick: () => {connectLeap()}
            },
            {
                label: 'Metamask Wallet',
                onClick: () => {connectMetamask()}
              }
          ]
        });
      };

    const getCount = async()=>{
        try {
            const queryClient = await CosmWasmClient.connect(API_URL);
        const queryCount = await queryClient?.queryContractSmart(
            contractAddress.at,
            {
               get_count:{} 
            }
        )
        console.log(queryCount);
        setCounterValue(queryCount.count);
        } catch (error) {
            console.log(error);
            return;
        }
        
        
    }

    const incrementCount = async()=>{
        if(!address){
            connectWallet();
            return;
        }
        // setCounterValue(counterValue+1);
        try {
            setIsLoading(true);
            const incCount = await client?.execute(
                (address as string),
               contractAddress.at,
               {
                  increment:{} 
               },{amount: [], gas: "500000"}
           )
           console.log(incCount);
           getCount();
           toast.success('Count incremented successfully',{
            position: "top-center",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: '10s',
            })
        } catch (error) {
            console.log(error);
            return;   
        }finally{
            setIsLoading(false);
        }
    }

  return (<>
  <div className='counter-container'>
        <div className='counter-status'>
            <div className='counter-count'>
                {counterValue}
            </div>
            <div className='counter-label'>
                CURRENT COUNT
            </div>
        </div>
        <div className='counter-increment'>
            <div className='inc-btn-wrapper'>
                <button disabled={isLoading}
                onClick={()=>modal()}>{!address?'Connect Wallet':isLoading?
                'Incrementing...':'Increase count'}</button> 
            </div>
        </div>
    </div>
        {/* <ToastContainer/>  */}
  </>
    
  )
}

export default Counter