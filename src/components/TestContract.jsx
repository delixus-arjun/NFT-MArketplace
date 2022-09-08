import React, { useState } from "react";
import { Select } from 'antd';
import { useMoralis , useMoralisQuery} from "react-moralis";
import { Card, Image,  Modal, Input, Alert, Upload, Button  ,H3, label, Form, textarea} from "antd";
import { useNFTBalance } from "hooks/useNFTBalance";
import { CompassOutlined, FileSearchOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { useMoralisDapp } from "providers/MoralisDappProvider/MoralisDappProvider";
import { getExplorer } from "helpers/networks";
import { useWeb3ExecuteFunction } from "react-moralis";
import Icon from '@ant-design/icons';
import Web3 from "web3"
import Moralis  from "moralis";
import { contractAddress , contractabi } from "../contractMint";
import moment from 'moment';

import { collectionAddr, CollectionFactoryABI , CollectionABI } from "../collectionContract/abi/CollectionContract";

const web3 = new Web3(Web3.givenProvider)

const { Meta } = Card;


function Create() {
const { Option } = Select;
const {user } = useMoralis();
const [name,setname] = useState('')
const [CollectionName,setCollectionName] = useState('')
const [CollectionSymbol,setCollectionSymbol] = useState('')

const [CollectionAddress,setCollectionAddress] = useState('')
const [description,setdescription] = useState('')
const [file,setfile] = useState()
const queryCollectionItem = useMoralisQuery("Collections");
const fetchCollection = JSON.parse(
  JSON.stringify(queryCollectionItem.data, [
    "ownerAddress",
    "CollectionName",
    "CollectionAddress",
    "symbol",
  ])
);

  const { TextArea } = Input;

const onSubmit  = async (e)=>{
  
    console.log("name:- ",name,"    desc:- ",description,  "CollectionAddress:- ", CollectionAddress)

    try {
        // save image to IPFS
        const filel = new Moralis.File(file.name,file);
        await filel.saveIPFS();
        const filelurl = filel.ipfs();
        console.log("fileUrl :- ", filelurl)

      // generate metadata and save to ipfs
      const metadata = {
                  name, description, image: filelurl
      }

      const file2 = new Moralis.File(`${name}metadata.json`, {
        base64: Buffer.from(JSON. stringify(metadata) ).toString ('base64')
      });
      
      await file2.saveIPFS();
      const metadataUrl = file2.ipfs(); 
      console.log("metaDtaUrl :- ", metadataUrl)
    

      const contract = new web3.eth.Contract(CollectionABI,CollectionAddress);
      const response = await contract.methods
      .mint(metadataUrl)
      .send({from:user.get("ethAddress")});

      const tokenId = response.events.Transfer.returnValues.tokenId;

      alert(`NFT sucessfully minted Contract address - ${contractAddress} and TokenId - ${tokenId}`);
      console.log(`NFT sucessfully minted Contract address - ${contractAddress} and TokenId - ${tokenId}`)

    } catch (error) {
      console.log("something  went Worng")
      alert(error)
    }
} 



const onCrateCollection  = async (e)=>{
  
    console.log("Collectionname:- ",CollectionName,"    CollectionSymbol:- ",CollectionSymbol)
    console.log("hello1")
   
      // interact with Contract

       console.log(fetchCollection)

      try {
        const contract = new web3.eth.Contract(CollectionFactoryABI,collectionAddr);
        console.log(collectionAddr)
  
  
         const response = await contract.methods
         .create(user.get("ethAddress"),CollectionName,CollectionSymbol)
         .send({from:user.get("ethAddress")});
  
         console.log("resopse:- ", response)

         var dateAndTime= moment().format("DD/MM/YYYY HH:mm:ss")

         const getAddress = await contract.methods
         .getlastObject().call();
  
         const Collections = Moralis.Object.extend("Collections");
         const Object = new Collections();
               Object.set("ownerAddress", getAddress.owner);
               Object.set("CollectionName", getAddress.collectionName);
               Object.set("CollectionAddress", getAddress.collectionAddr);
               Object.set("symbol", getAddress.collSymbol);
               Object.set("time",dateAndTime)
               Object.save();
          
               
      alert(`Collection sucessfully Created - ${contractAddress}`);

      } catch (error) {
        
        console.log("resopse:- error")
      }
     



      
             

    //   const tokenId = response.events.Transfer.returnValues.tokenId;

    //   alert(`NFT sucessfully minted Contract address - ${contractAddress} and TokenId - ${tokenId}`);
    //   console.log(`NFT sucessfully minted Contract address - ${contractAddress} and TokenId - ${tokenId}`)

   

} 

function onChange(value) {
  setCollectionAddress(value);
}

  return (
    <>
     <div>
          

                <div style={{float : "left"}}>


                    <Form  layout={"vertical"} name="Collectionform"  id="collectionForm" onFinish={onCrateCollection} >
                    <h3>Create NFT Collection</h3>

                    <br></br>
                        <Form.Item name="Collectionname" label="CollectionName" rules={[{ required: true }]}>
                            <Input type="text" placeholder="Enter Collection Name" value={name} onChange={e=> setCollectionName(e.target.value)}/>
                        </Form.Item>
                        
                        <Form.Item name="CollectionSymbol" label="Collection Symbol" rules={[{ required: true }]}>
                            <TextArea rows={5} type="text" id="CollectionSymbol" placeholder="Collection Symbol" value={description} onChange={e=> setCollectionSymbol(e.target.value)}/>
                        </Form.Item>
                                
                         

                        <br></br>
                        
                        <Form.Item >
                        <Button block type="primary" htmlType="submit">Submit</Button>
                        </Form.Item>

                        

                    </Form>

            </div>

     <div style={{float : "left" , marginLeft : "50px"}}>
             
           
             <Form  layout={"vertical"} name="NFTform"  id="nftForm" onFinish={onSubmit} >
             <h3>Mint Your NFT</h3>
             <br></br>
                 <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                     <Input type="text" placeholder="Enter NFT Name" value={name} onChange={e=> setname(e.target.value)}/>
                 </Form.Item>
                 
                 <Form.Item name="Description" label="NFT Description" rules={[{ required: true }]}>
                     <TextArea rows={5} type="text" id="description" placeholder="description " value={description} onChange={e=> setdescription(e.target.value)}/>
                 </Form.Item>
                
 
                 <Form.Item name="CollectionAddress" label="CollectionAddress" rules={[{ required: true }]}>
                
                 
                  <Select
                  showSearch
                  style={{width: "600px"}}
                  placeholder="Find a Collection"
                  optionFilterProp="children"
                  onChange={onChange}
                  
              >   
              {fetchCollection && 
                  fetchCollection.map((collection, i) => 
                  <Option value={collection.CollectionAddress} key= {i}>{collection.CollectionName}</Option>
                  )
                  }   
              </Select>
                 </Form.Item>
             
                 <Form.Item name="file" >
                 <Input  type="file" onChange={e=> setfile(e.target.files[0])}/>
                 </Form.Item>
 
 
                             
 
                
                 <br></br>
               
                 <Form.Item >
                 <Button block type="primary" htmlType="submit">Submit</Button>
                 </Form.Item>
 
                
             
             </Form>
       </div>

        

     </div>

     
    </>
  );
}

export default Create;
