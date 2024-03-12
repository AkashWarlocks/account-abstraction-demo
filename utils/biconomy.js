  const { ethers, providers, Wallet, Contract}  = require("ethers").ethers;	
  const { BiconomySmartAccountV2, DEFAULT_ENTRYPOINT_ADDRESS, DefaultGasLimit} =require("@biconomy/account");
  const { IHybridPaymaster, SponsorUserOperationDto, PaymasterMode, BiconomyPaymaster} = require("@biconomy/paymaster");
  const { Bundler } = require("@biconomy/bundler");
  const { ECDSAOwnershipValidationModule, DEFAULT_ECDSA_OWNERSHIP_MODULE } = require("@biconomy/modules")
  const { ChainId } = require("@biconomy/core-types")
  const platfromAd = require('../contracts/PlatformAd.json');

  require('dotenv').config()
  let provider = new providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
  let signer = new Wallet(process.env.PV_KEY, provider);

  const bundler = {
  // get from biconomy dashboard https://dashboard.biconomy.io/
    bundlerUrl: "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    chainId: ChainId.POLYGON_MUMBAI, // or any supported chain of your choice
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
  }

  // Initiating Paymaster Details
  const paymaster = new BiconomyPaymaster({
    paymasterUrl: "https://paymaster.biconomy.io/api/v1/80001/RPWHFC6lM.d83564fb-4da8-4341-8e7b-97d5eab081cb",
  })

  const biconomySmartAccountConfig = {
    signer: signer,
    chainId: 80001,
    biconomyPaymasterApiKey: "https://paymaster.biconomy.io/api/v1/80001/RPWHFC6lM.d83564fb-4da8-4341-8e7b-97d5eab081cb",
    bundlerUrl: "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
    entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS
  };

  async function createAccount() {
    const biconomySmartAccount = await BiconomySmartAccountV2.create(
        biconomySmartAccountConfig
    );
    // getAccountAddress() -> deploys smart account if called for the first time
    console.log(await biconomySmartAccount.getAccountAddress())   
    return biconomySmartAccount.accountAddress;
  }

  async function viewAd() {
    try {
 
       
        const module = await ECDSAOwnershipValidationModule.create({
            signer:signer,
            moduleAddress: DEFAULT_ECDSA_OWNERSHIP_MODULE
        })

        const account = await BiconomySmartAccountV2.create(
            {
                chainId:ChainId.POLYGON_MUMBAI,
                biconomyPaymasterApiKey:"NHZ1ckEE_.503ed1f8-cb0a-47d6-8486-51f637b1a230",
                bundlerUrl: "https://bundler.biconomy.io/api/v2/80001/nJPK7B3ru.dd7f7861-190d-41bd-af80-6877f74b8f44",
                entryPointAddress: DEFAULT_ENTRYPOINT_ADDRESS,
                defaultValidationModule: module,
                activeValidationModule: module,
                rpcUrl: "https://rpc-mumbai.maticvigil.com"
            }
        )
        console.log("address: ", await account.getAccountAddress());

        const platformAdAddress = "0x7Add7da63b07255A3c3d25757497212928165601";

        const abi = platfromAd.abi;
        const contract = new Contract(platformAdAddress, abi, provider);

        const viewAd = await contract.populateTransaction.viewAd()

        const tx =  {
            to: platformAdAddress,
            data: viewAd.data
            
        } 
    // ,{
    //         paymasterServiceData : {
    //             mode: PaymasterMode.SPONSORED,
    //             smartAccountInfo: {
    //                 name: 'BICONOMY',
    //                 version: '2.0.0'
    //             },
    //             calculateGasLimits:true
    //         },
    //         skipBundlerGasEstimation:true,
    //         overrides:{
    //             callGasLimit:DefaultGasLimit.callGasLimit
    //         }
    //     }
        let userOp = await account.buildUserOp([tx],{
            paymasterServiceData: {
                mode: PaymasterMode.SPONSORED,
                calculateGasLimits:true
            },
            // No need to explicitly set skipBundlerGasEstimation: true, as it's true by default for paymaster flow
        });

        // const gasEstimate = await account.estimateUserOpGas({userOp,paymasterServiceData: {
        //         mode: PaymasterMode.SPONSORED,
        //         calculateGasLimits:true
        //     },skipBundlerGasEstimation:false})


       // Add paymaster details to account 
       const biconomyPaymaster = account.paymaster;
        // const biconomyPaymaster = IHybridPaymaster;

        let paymasterServiceData = {
            mode: PaymasterMode.SPONSORED,
            smartAccountInfo: {
                name: 'BICONOMY',
                version: '2.0.0'
            },
        };
      const paymasterAndDataResponse = await biconomyPaymaster.getPaymasterAndData(userOp, paymasterServiceData);
      userOp.paymasterAndData = paymasterAndDataResponse.paymasterAndData;
      
      let data = await account.signUserOp(userOp);
        
      // Send userOp to Altmempool / Bundler
      const userOpResponse = await account.sendSignedUserOp(data)
      //const userOpResponse = await account.sendUserOp(userOp);
      console.log("userOpHash", userOpResponse);
      
      const { receipt } = await userOpResponse.wait(1);
      console.log("txHash", receipt.transactionHash);

      const logs = await contract.queryFilter('AdViewed', receipt.blockNumber, 'latest');
      logs.forEach(log => {
        console.log(log);
      });
      return receipt;
    } catch (error) {
        throw error;
    }
  }

  async function internalTransaction(hash) {
    try {
        
    } catch (error) {
        throw error
    }
  }


  module.exports = {createAccount, viewAd}