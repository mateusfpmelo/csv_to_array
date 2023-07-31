import React, { useState, useEffect } from 'react';
import Axios from 'axios';
import './App.css';
import carregando from './img/carregando.png'
import logo_branca from './img/logo.png'
<link href="https://fonts.googleapis.com/css2?family=Open+Sans&display=swap" rel="stylesheet"/>


const App = () => {
  const [file, setFile] = useState(null);
  const [data, setData] = useState([]);
  const [jsonEnvio, setJsonEnvio] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tempNumber, setTempNumber] = useState('');

  useEffect(() => {
    // Função que será executada sempre que 'file' for alterado
    if (file) {
      // Cria um novo FileReader para ler o conteúdo do arquivo
      const reader = new FileReader(); 
      // Define a função que será chamada quando o arquivo for lido
      reader.onload = (e) => {
        // Obtém o conteúdo do arquivo e remove todas as ocorrências de '\r' (carriage return)
        const data = e.target.result.replace(/\r/g, ''); 
        // Divide o conteúdo em linhas, considerando que cada linha é separada por '\n'
        const rows = data.split('\n');
        // Verifica se a primeira linha contém os valores esperados cpf, dt_nascimento, nome_mae
        const headerValues = rows[0].split(',');
        if (
          headerValues[0].trim() !== 'cpf' ||
          headerValues[1].trim() !== 'dt_nascimento' ||
          headerValues[2].trim() !== 'nome_mae'
        ) {
          setFile(''); // Remove o arquivo do input, definindo-o como nulo
          console.log(file)
          alert(
            'Base inserida não está no formato necessário, favor considerar: primeira coluna: cpf, segunda coluna: dt_nascimento, terceira coluna: nome_mae!'
          );
          console.log('file após alert:', file)
          return; // Encerra o processamento
        }
        // Remove a primeira linha (cabeçalho) do arquivo, presumindo que ela não precisa ser processada
        rows.shift();
  
        // Cria um array de arrays com no máximo 2 linhas (pode ser ajustado para 999)
        const arrayChunks = []
        //const chunkSize = 999;
        const chunkSize = 999; // Tamanho dos pedaços de array
        while (rows.length > 0) {
          arrayChunks.push(rows.splice(0, chunkSize))
        }
  
        // Converte cada pedaço para o formato JSON necessário (requisição JSON)
        const arrays = arrayChunks.map(
          chunk => {
            return chunk.map(
              (row) => {
                // Divide cada linha em colunas, considerando que elas são separadas por ','
                const columns = row.split(',')
                return {
                  cpf: columns[0],
                  dt_nascimento: columns[1],
                  nome_mae: columns[2],
                };
              }
            );
          }
        );
        // Atualiza o estado 'data' com o resultado do processamento
        setData(arrays)
        // Indica que o carregamento está concluído, atualizando o estado 'isLoading' para 'false'
        setIsLoading(false)
        // Armazena o número de arrays resultantes em 'tempNumber'
        const numberOfArrays = arrays.length;
        // Converte o resultado final do processamento para JSON e atualiza o estado 'jsonEnvio'
        setTempNumber(numberOfArrays)
        const json = JSON.stringify(arrays)
        setJsonEnvio(json);
         // Exibe o valor de 'numberOfArrays' no console para análise
        console.log('numberOfArrays ANALISAR - USEFFECT:', numberOfArrays)
      };
      reader.readAsText(file)
    }
  }, [file])// Dependência 'file' que dispara o efeito sempre que seu valor é alterado


  const handleSubmit = async (e) => {
    e.preventDefault();

    // Verifica se há dados no estado 'data'
    if (data.length === 0) {
      console.log('Nenhum dado a ser enviado.');
      alert('Nenhum arquivo selecionado!')
      return;
    }

    const url = `http://localhost:5000/api/confirm_data_persons`;

    // const url = `${process.env.REACT_APP_REQ}api/confirm_data_persons`;
    
    setIsLoading(true)
    try {
      for (const dataArray of data) {
        const requestData = { data: dataArray };
        console.log('Número de itens enviados na requisição:', dataArray.length);
        const response = await Axios.post(url, requestData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        

        console.log('Resposta do backend:', response.data);
        setIsLoading(false)
      }
    } catch (error) {
      console.log('Erro ao enviar dados:', error);
      setIsLoading(false)
    }
  };

  return (
    <div className='insertvalidacao_geral'>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Mulish:wght@200;300&display=swap');
      </style>
      <div className='insertvalidacao_geral_bg'>
        <div className='insertvalidacao_geral_divlogotexto'>
          <div>
            <img className='insertvalidacao_geral_logogeral' src={logo_branca} alt="Logo" />
          </div>
          <div className='insertvalidacao_geral_texto1'>
            <div>Favor inserir um arquivo tipo csv que contenha as seguintes colunas: </div>
            <br />
            <div><b>cpf, dt_nascimento, nome_mae, respectivamente.</b></div>
          </div>
        </div>
        <div>
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0])} />
        </div>
        {tempNumber > 0 && (
          <div>QT ARRAYS GERADOS: <b>{tempNumber}</b></div>
        )
        }
        {isLoading &&
          <div className='insertvalidacao_geral_carregamento'>
            <div>
              <img className='insertvalidacao_geral_carregamento_img' src={carregando} alt="Carregamento" />
            </div>
            <div><strong>C A R R E G A N D O</strong></div>
          </div>
        }
        <div>
          <button className='insertvalidacao_geral_button_submit' disabled={isLoading} onClick={handleSubmit}>ENVIAR</button>
        </div>
        
        {/* // ative se quiser ver o array na tela
        <div className='apagar_1'>
          <div><b>JSON FORMATADO: </b></div><div>{jsonEnvio}</div>
        </div>*/}
      </div>
      
      
    </div>
  );
};

export default App;