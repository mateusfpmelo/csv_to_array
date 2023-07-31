import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './App.css';
import coracao_rosa from './img/teste1.png'

const App = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [jsonEnvio, setJsonEnvio] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setIsLoading(true)
        const data = e.target.result.replace(/\r/g, ''); // Remove all occurrences of \r
        const rows = data.split('\n');
        
        // Remove the header row
        rows.shift();
  
        // Create an array of arrays with a maximum of 999 lines per sub-array
        const arrayChunks = []
        const chunkSize = 999;
        while (rows.length > 0) {
          arrayChunks.push(rows.splice(0, chunkSize))
        }
  
        // Convert each chunk to the desired format (like your current mapping logic)
        const arrays = arrayChunks.map(chunk => {
          return chunk.map((row) => {
            const columns = row.split(',')
            return {
              cpf: columns[0],
              dt_nascimento: columns[1],
              nome_mae: columns[2],
            };
          });
        });
  
        setData(arrays)
        setIsLoading(false)
        const numberOfArrays = arrays.length;
        // Convert the whole data without the header to JSON
        const json = JSON.stringify(arrays)
        setJsonEnvio(json);
        console.log('numberOfArrays ANALISAR - USEFFECT:', numberOfArrays)
      };
      reader.readAsText(file)
    }
  }, [file])


  const handleSubmit = (e) => {
    e.preventDefault(); 
    const url = `${process.env.REACT_APP_REQ}api/confirm_data_persons`;
    const formData = new FormData();
    formData.append('data', JSON.stringify(data));
    console.log('Verificar o que rola aqui:')
    console.log(formData)
    Axios.post(url, formData, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className='insertvalidacao_geral'>
      <div className='insertvalidacao_geral_texto1'><b>
        Favor inserir um arquivo tipo csv ou xlsx que contenha as seguintes colunas: cpf, dt_nascimento, nome_mae:
      </b></div>
      <div>
        <input type="file" accept=".xlsx, .csv" onChange={(e) => setFile(e.target.files[0])} />
      </div>
      {isLoading &&
        <div className='divcarregamento_internal_modal_laranja'>
          <div>
            <img className='coracao_young' src={coracao_rosa} alt="Coração young" />
          </div>
          <div><strong>C A R R E G A N D O</strong></div>
        </div>
      }
      <div>
        <button className='insertvalidacao_geral_button_submit' onClick={handleSubmit}>ENVIAR</button>
      </div>
      
      <div className='apagar_1'>
        <div><b>JSON FORMATADO: </b></div><div>{jsonEnvio}</div>
      </div>
      
      
    </div>
  );
};

export default App;