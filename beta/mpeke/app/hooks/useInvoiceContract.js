
import invoiceFactoryAbi from '../contracts/invoice/invoiceFactory.abi.json';
import { client } from "../../lib/client";
const contractAddress = '0xaCF436447981e25003cA0f5B43644621d3608943';


const useInvoiceContract = () => {
  const [contract, setContract] = useState(null);

  useEffect(() => {
    const init = async () => {
      const contractInstance = getContract({
        client,
        address: contractAddress,
        abi: invoiceFactoryAbi,
      });
      setContract(contractInstance);
    };

    init();
  }, []);

  return contract;
};


export default useInvoiceContract
