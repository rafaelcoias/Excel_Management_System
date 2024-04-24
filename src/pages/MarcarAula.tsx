import React, { useState, useEffect } from 'react';
import * as XLSX from "xlsx";
import { gerarHorasPossiveis, isHoraMaisRecente } from "../js/auxilioEscolhaAula";
import { useNavigate } from "react-router-dom";

export default function MarcarAula() {
    const navigate = useNavigate();
    //guardar as informações do ficheiro horario
    const [horariosFile, setHorariosFile] = useState<any>(null);
    //guardar nome do ficheiro horario
    const [horariosFileName, setHorariosFileName] = useState<string>("");
    //guardar nome do ficheiro sala
    const [salasFileName, setSalasFileName] = useState<string>("");
    //guardar as informações do ficheiro sala
    const [salaFile, setSalaFile] = useState<any>(null);
    //saber se já fez o upload dos dois ficheiros
    const [uploading, setUploading] = useState<boolean>(false);

    //escolha do curso
    const [uniqueItemsCurso, setUniqueItemsCurso] = useState<any>([]);
    const [selectedItemCurso, setSelectedItemCurso] = useState<any>('');

    //escolha da UC
    const [uniqueItemsUC, setUniqueItemsUC] = useState<any>([]);
    const [selectedItemUC, setSelectedItemUC] = useState<any>('');

    //escolha da Turma
    const [uniqueItemsTurma, setUniqueItemsTurma] = useState<any>([]);
    const [selectedItemTurma, setSelectedItemTurma] = useState<any>(null);

    //escolha hora inicio e fim
    const horas = gerarHorasPossiveis();
    const [selectedItemHoraInicio, setSelectedItemHoraInicio] = useState<any>(null);
    const [selectedItemHoraFim, setSelectedItemHoraFim] = useState<any>(null);

    //escolha dia do ano
    const [uniqueItemsDia, setUniqueItemsDia] = useState<any>([]);
    const [selectedItemDia, setSelectedItemDia] = useState<any>(null);

    //escolha dia da semana
    const [uniqueItemsDiaSemana, setUniqueItemsDiaSemana] = useState<any>([]);
    const [selectedItemDiaSemana, setSelectedItemDiaSemana] = useState<any>(null);
    // escolha dia do mes ou dia da semnana
    const [selectedDataAula, setSelectedDataAula] = useState<any>(null);

    //escolha capacidade
    const [selectedItemCapacidade, setSelectedItemCapacidade] = useState<any>(null);

    //escolha sala
    const [uniqueItemsSala, setUniqueItemsSala] = useState<any>([]);
    const [selectedItemSala, setSelectedItemSala] = useState<any>(null);
    //escolha capacidade/sala
    const [selectedCap_Sala, setSelectedCap_Sala] = useState<any>(null);

    //fazer o ver possibilidades
    const [verPossibilidades, setVerPossibilidades] = useState<boolean>(false);

    /**
    * Função para lidar com a mudança de arquivo de horários.
    * Converte o arquivo Excel para JSON e define os dados resultantes no estado.
    *
    * @param {React.ChangeEvent<HTMLInputElement>} event - O evento de mudança que ocorre quando um arquivo é selecionado.
    * @returns {void} - Esta função não retorna nenhum valor.
    */
    const handleHorariosFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (
            file &&
            (file.name.endsWith(".csv") ||
                file.name.endsWith(".xls") ||
                file.name.endsWith(".xlsx") ||
                file.name.endsWith(".xlsm"))
        ) {
            setHorariosFileName(file.name);
            convertExcelToJson(file, setHorariosFile);
        } else {
            alert("Por favor escolha um ficheiro com formato excel.");
        }
    };

    /**
     * Função para lidar com a mudança de arquivo de sala.
     * Converte o arquivo Excel para JSON e define os dados resultantes no estado.
     *
     * @param {React.ChangeEvent<HTMLInputElement>} event - O evento de mudança que ocorre quando um arquivo é selecionado.
     * @returns {void} - Esta função não retorna nenhum valor.
     */
    const handleSalaFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        if (
            file &&
            (file.name.endsWith(".csv") ||
                file.name.endsWith(".xls") ||
                file.name.endsWith(".xlsx") ||
                file.name.endsWith(".xlsm"))
        ) {
            setSalasFileName(file.name);
            convertExcelToJson(file, setSalaFile);
        } else {
            alert("Por favor escolha um ficheiro com formato excel.");
        }
    };

    /**
     * Função para converter um arquivo Excel em JSON.
     *
     * @param {any} file - O arquivo Excel a ser convertido.
     * @param {React.Dispatch<React.SetStateAction<any[]>>} setDataCallback - O callback para definir os dados resultantes no estado.
     * @returns {void} - Esta função não retorna nenhum valor.
     */
    const convertExcelToJson = (file: any, setDataCallback: React.Dispatch<React.SetStateAction<any[]>>) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const data = new Uint8Array(arrayBuffer);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                header: 1,
                defval: ""
            });
            setDataCallback(jsonData);
        };
        reader.readAsArrayBuffer(file);
    };

    /**
     * Função para lidar com o botão de continuar.
     * Realiza algumas verificações e atualiza o estado com base nos arquivos de horários e sala selecionados.
     *
     * @returns {void} - Esta função não retorna nenhum valor.
     */
    const handleContinuar = () => {
        if (horariosFile && salaFile) {
            setUploading(true);
            const columnData: any[] = horariosFile.flatMap((row: any) => {
                // Faz o split por vírgula em cada string dentro de row[0]
                return row[0].split(',').map((item: string) => item.trim());
            });
            if (Array.isArray(columnData)) {
                const uniqueItems = Array.from(new Set(columnData)).sort((a, b) => a.localeCompare(b));
                setUniqueItemsCurso(uniqueItems);
                setSelectedItemCurso(uniqueItems[0]); // Seleciona o primeiro item
            } else {
                alert("Erro ao processar os dados do arquivo de horários.");
            }
        } else {
            alert("Por favor preencha todos os campos");
        }
    }

    
    //Função de efeito para mostrar as unidades curriculares com base no arquivo de horários selecionado.
    //Atualiza o estado com as unidades curriculares únicas.
    useEffect(() => {
        const mostrarUC = () => {
            if (horariosFile) {
                const filteredData: any[] = horariosFile.filter((row: any) => row[0].includes(selectedItemCurso));
                const columnData: any[] = filteredData.map((row: any) => row[1]);
                if (Array.isArray(columnData)) {
                    const uniqueItems = Array.from(new Set(columnData));
                    setUniqueItemsUC(uniqueItems);
                    setSelectedItemUC(uniqueItems[0]); // Seleciona o primeiro item
                } else {
                    alert("Erro ao processar os dados do arquivo de horários.");
                }
            }
        };

        mostrarUC();
    }, [selectedItemCurso]);


    //Atualiza a lista de turmas com base nos arquivos de horários e salas selecionados,
    //bem como nas unidades curriculares e curso selecionados
    useEffect(() => {
        const mostrarTurmas = () => {
            if (horariosFile && salaFile && selectedItemUC && selectedItemCurso) {
                const filteredDataUC: any[] = horariosFile.filter((row: any) => row[1].includes(selectedItemUC));
                const filteredDataCurso: any[] = filteredDataUC.filter((row: any) => row[0].includes(selectedItemCurso));
                const columnData: any[] = filteredDataCurso.map((row: any) => row[3]);
                if (Array.isArray(columnData)) {
                    const uniqueItems = Array.from(new Set(columnData));
                    setUniqueItemsTurma(uniqueItems);
                    setSelectedItemTurma(uniqueItems[0]); // Seleciona o primeiro item
                } else {
                    alert("Erro ao processar os dados do arquivo de horários.");
                }
            }
        };
        mostrarTurmas();
    }, [selectedItemUC]);

    //Atualiza a lista de dias disponíveis com base nos arquivos de horários, salas e turmas selecionados,
    //bem como nas unidades curriculares e curso selecionados
    useEffect(() => {
        const mostrarDia = () => {
            if (horariosFile && salaFile && selectedItemUC && selectedItemCurso && selectedItemTurma) {
                const columnData: any[] = horariosFile.map((row: any) => row[8]);
                if (Array.isArray(columnData)) {
                    const uniqueItems = Array.from(new Set(columnData));
                    setUniqueItemsDia(uniqueItems);
                    setSelectedItemDia(uniqueItems[0]); // Seleciona o primeiro item
                }
            }
        }
        mostrarDia();
    }, [selectedItemUC, selectedItemCurso, selectedItemTurma]);

    //Atualiza a lista de dias da semana disponíveis com base nos arquivos de horários, salas e turmas selecionados,
    //bem como nas unidades curriculares e curso selecionados.
    useEffect(() => {
        const mostrarDiaSemana = () => {
            if (horariosFile && salaFile && selectedItemUC && selectedItemCurso && selectedItemTurma) {
                const columnData: any[] = horariosFile.map((row: any) => row[5]);
                if (Array.isArray(columnData)) {
                    const uniqueItems = Array.from(new Set(columnData));
                    setUniqueItemsDiaSemana(uniqueItems);
                    setSelectedItemDiaSemana(uniqueItems[0]); // Seleciona o primeiro item
                }
            }
        }
        mostrarDiaSemana();
    }, [selectedItemUC, selectedItemCurso, selectedItemTurma]);

    //Atualiza a lista de salas disponíveis com base nos arquivos de horários, salas e turmas selecionados,
    //bem como nas unidades curriculares e curso selecionados.
    useEffect(() => {
        const mostrarSala = () => {
            if (horariosFile && salaFile && selectedItemUC && selectedItemCurso && selectedItemTurma) {
                const headerRow = salaFile[0]; // Linha do cabeçalho
                const columnData: any[] = salaFile.slice(1).map((row: any) => {
                    let salaWithName: string = row[1]; // Nome inicial da sala
                    for (let i = 1; i < row.length; i++) {
                        if (row[i] === 'X') {
                            salaWithName += ';' + headerRow[i]; // Adiciona o nome da coluna se houver 'X'
                        }
                    }
                    return salaWithName;
                });
                if (Array.isArray(columnData)) {
                    const uniqueItems = Array.from(new Set(columnData));
                    setUniqueItemsSala(uniqueItems);
                    //setSelectedItemSala(uniqueItems[0]); // Seleciona o primeiro item
                }
            }
        };
        mostrarSala();
    }, [selectedItemTurma]);


    //Executa a verificação de possibilidades quando o estado 'verPossibilidades' é alterado.
    //Verifica se todos os campos necessários estão preenchidos corretamente.
    useEffect(() => {
        if (verPossibilidades) {
            const handleVerPossibilidades = () => {

                if (!selectedItemHoraInicio || !selectedItemHoraFim) {
                    alert("Por favor preencha todos os campos 'Hora Inicio' e 'Hora Fim'.");
                    return; // Sai da função se algum dos campos estiver vazio
                }

                // Verifica se as horas foram preenchidas corretamente antes de usar a função isHoraMaisRecente
                const horaInicio = selectedItemHoraInicio === "Hora Inicio" ? null : selectedItemHoraInicio;
                const horaFim = selectedItemHoraFim === "Hora Fim" ? null : selectedItemHoraFim;

                if (!horaInicio || !horaFim) {
                    alert("Por favor preencha todos os campos 'Hora Inicio' e 'Hora Fim'.");
                    return; // Sai da função se algum dos campos estiver com valor incorreto
                }

                if (!isHoraMaisRecente(horaFim, horaInicio)) {
                    alert("A 'Hora Inicio' tem que ser mais antiga que a 'Hora Fim'!");
                }

                // Verifica se foi selecionado um dia da semana
                const diaSemana = selectedDataAula === 'diaSemana' ? selectedItemDiaSemana : null;
                if (selectedDataAula === 'diaSemana') {
                    if (diaSemana === 'Dia da semana')
                        alert("Escolha um dia da semana!");
                }

                // Verifica se foi selecionado um dia do ano
                const diaAno = selectedDataAula === 'diaAno' ? selectedItemDia : null;
                if (selectedDataAula === 'diaAno') {
                    if (diaAno === 'Data da aula')
                        alert("Escolha um dia da ano!");
                }

                // Verifica se foi selecionado um tipo de sala
                console.log(selectedCap_Sala);
                const espaco = selectedCap_Sala === 'espaco' ? selectedItemSala : null;
                console.log(espaco);
                if (selectedCap_Sala === 'espaco') {
                    if (espaco === "Tipo de Sala")
                        alert("Escolha o Tipo de sala!");
                }
                
                //Verifica se a capacidade selecionada é maior que 0
                const capacidade = selectedCap_Sala === 'capacidade' ? selectedItemCapacidade : null;
                console.log(capacidade);
                if (selectedCap_Sala === 'capacidade') {
                    if (capacidade === 0)
                        alert("A capacidade tem de ser maior que 0");
                }
            };

            handleVerPossibilidades();
        }
    }, [verPossibilidades]);

    ////////////////////////////////PAGINA HTML/////////////////////////////////

    if (!uploading) {
        return (
            <div className="flex flex-col items-center justify-center">
                <div className="absolute top-8 left-[4vw] font-mybold text-black">
                    <button
                        onClick={() => navigate(-1)}
                        className="absolute top-8 left-[4vw] font-mybold text-black"
                    >  ⬅VOLTAR
                    </button>
                </div>

                <div className="mt-[300px] flex justify-center items-center flex-col">
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-4 border-2 border-black p-8 rounded-[30px]">
                            <p className="text-center text-lg font-bold">
                                <span className="text-black">+</span> Upload de Horários
                            </p>
                            {!horariosFile ? (
                                <input type="file" id="horarios" accept=".csv,.xlsx" onChange={handleHorariosFileChange} className="text-lg" />
                            ) : (
                                <div className="flex items-center">
                                    <div>{horariosFileName}</div>
                                    <button onClick={() => setHorariosFile(null)} className="ml-5 px-2 py-1 bg-[var(--blue)] text-white rounded-md hover:bg-white hover:text-[var(--blue)] transition-all duration-300">↺</button>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-4 border-2 border-black p-8 rounded-[30px]">
                            <p className="text-center text-lg font-bold">
                                <span className="text-black">+</span> Upload de Sala
                            </p>
                            {!salaFile ? (
                                <input type="file" id="sala" accept=".csv,.xlsx" onChange={handleSalaFileChange} className="text-lg" />
                            ) : (
                                <div className="flex items-center">
                                    <div>{salasFileName}</div>
                                    <button onClick={() => setSalaFile(null)} className="ml-5 px-2 py-1 bg-[var(--blue)] text-white rounded-md hover:bg-white hover:text-[var(--blue)] transition-all duration-300">↺</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>


                <button className="mt-20 px-10 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300" onClick={handleContinuar}>Continuar</button>
            </div>
        );
    }


    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <div className="absolute top-8 left-4 font-mybold text-black">
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-8 left-[4vw] font-mybold text-black"
                >  ⬅VOLTAR
                </button>
            </div>

            <div className="flex flex-col items-center justify-center h-screen">
                <div className="w-[800px] border-2 border-black p-8 rounded-3xl">
                    <div className="mb-4 flex justify-between">
                        <label htmlFor="selectedItemCurso" >Selecione um curso:</label>
                        <select className="w-[320px] select-text" id="selectedItemCurso" value={selectedItemCurso || ''} onChange={(e) => { setSelectedItemCurso(e.target.value); }} >
                            {uniqueItemsCurso.map((item: string, index: number) => (
                                <option key={index} value={item}>{item}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4 flex justify-between">
                        <label htmlFor="selectedItemUC">Selecione uma UC:</label>
                        {selectedItemCurso !== "Curso" ? (
                            <select className="w-[320px] select-text" id="selectedItemUC" value={selectedItemUC || ''} onChange={(e) => { setSelectedItemUC(e.target.value); }}>
                                {uniqueItemsUC.map((item: string, index: number) => (
                                    <option key={index} value={item}>{item}</option>
                                ))}
                            </select>
                        ) : (
                            <div></div>
                        )}
                    </div>

                    <div className="mb-4 flex justify-between">
                        <label htmlFor="selectedItemTurma">Selecione as Turmas:</label>
                        {selectedItemCurso !== "Curso" && selectedItemTurma !== null ? (
                            <select className="w-[320px] select-text" id="selectedItemTurma" value={selectedItemTurma || ''} onChange={(e) => setSelectedItemTurma(e.target.value)}>
                                {uniqueItemsTurma.map((item: string, index: number) => (
                                    <option key={index} value={item}>{item}</option>
                                ))}
                            </select>
                        ) : (
                            <div></div>
                        )}

                    </div>

                    <hr className="ml-4 w-[95%] border-gray-400 my-6" />

                    <div className="mb-4 flex justify-between">
                        <div className="ml-10 flex flex-row">
                            <label htmlFor="selectedItemHoraInicio">Hora Inicio:</label>
                            {selectedItemCurso !== "Curso" && selectedItemTurma !== null && selectedItemTurma !== null ? (
                                <select className="ml-10 mr-10 w-[150px] select-text" id="selectedItemHoraInicio" value={selectedItemHoraInicio || ''} onChange={(e) => setSelectedItemHoraInicio(e.target.value)}>
                                    <option value="Hora Inicio">Hora Inicio</option>
                                    {horas.map((item: string, index: number) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </select>
                            ) : (
                                <div></div>
                            )}
                        </div>
                        <div className="flex flex-row">
                            <label htmlFor="selectedItemHoraFim">Hora Fim:</label>
                            {selectedItemCurso !== "Curso" && selectedItemTurma !== null && selectedItemTurma !== null ? (
                                <select className="ml-10 mr-10 w-[150px] select-text" id="selectedItemHoraFim" value={selectedItemHoraFim || ''} onChange={(e) => setSelectedItemHoraFim(e.target.value)}>
                                    <option value="Hora Fim">Hora Fim</option>
                                    {horas.map((item: string, index: number) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </select>
                            ) : (
                                <div></div>
                            )}
                        </div>
                    </div>

                    <hr className="ml-4 w-[95%] border-gray-400 my-6" />


                    <div className="mb-4 flex justify-between">
                        <label htmlFor="optionData">Escolha uma opção de data:</label>
                        <select className="w-[320px] select-text" id="optionData" value={selectedDataAula || ''} onChange={(e) => setSelectedDataAula(e.target.value)}>
                            <option value="diaSemana">Dia da Semana</option>
                            <option value="diaAno">Data da aula</option>
                        </select>
                    </div>
                    <div className="mb-4 flex justify-between">
                        {selectedDataAula === "diaAno" ? (
                            <>
                                <label htmlFor='selectedItemDia'>Data da aula:</label>
                                <select className="w-[320px] select-text" id="selectedItemDia" value={selectedItemDia || ''} onChange={(e) => { setSelectedItemDia(e.target.value); setSelectedItemDiaSemana(uniqueItemsDiaSemana[0]) }}>
                                    {uniqueItemsDia.map((item: string, index: number) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </select>
                            </>
                        ) :
                            (
                                <>
                                    <label htmlFor='selectedItemDiaSemana'>Dia da Semana:</label>
                                    <select className="w-[320px] select-text" id="selectedItemDiaSemana" value={selectedItemDiaSemana || ''} onChange={(e) => { setSelectedItemDiaSemana(e.target.value); setSelectedItemDia(uniqueItemsDia[0]) }}>
                                        {uniqueItemsDiaSemana.map((item: string, index: number) => (
                                            <option key={index} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                    </div>

                    <hr className="ml-4 w-[95%] border-gray-400 my-6" />

                    <div className="mb-4 flex justify-between">
                        <label htmlFor="optionCap_Sala">Escolha um espaço/capacidade:</label>
                        <select className="w-[320px] select-text" id="optionCap_Sala" value={selectedCap_Sala || ''} onChange={(e) => setSelectedCap_Sala(e.target.value)}>
                            <option value="espaco">Espaço</option>
                            <option value="capacidade">Capacidade</option>
                        </select>
                    </div>
                    <div className="mb-4 flex justify-between" >
                        {selectedCap_Sala === "capacidade" ? (
                            <>
                                <label htmlFor='selectedItemCapacidade'>Capacidade:</label>
                                <input className="w-[320px] select-text border border-black rounded-md pl-2 text-right"
                                    type="number"
                                    id="selectedItemCapacidade"
                                    value={selectedItemCapacidade || 0}
                                    min='0'
                                    onChange={(e) => { setSelectedItemCapacidade(e.target.value); setSelectedItemSala("Tipo de Sala") }} />
                            </>
                        ) :
                            (
                                <>
                                    <label htmlFor='selectedItemSala'>Espaco:</label>
                                    <select className="w-[320px] select-text" id="selectedItemSala" value={selectedItemSala || ''} onChange={(e) => { setSelectedItemSala(e.target.value); setSelectedItemCapacidade(0) }}>
                                        <option value="Tipo de Sala">Tipo de Sala</option>
                                        {uniqueItemsSala.map((item: string, index: number) => (
                                            <option key={index} value={item}>{item}</option>
                                        ))}
                                    </select>
                                </>
                            )}
                    </div>

                </div>
                <div className="col-span-3 flex justify-center">
                    <button onClick={() => setVerPossibilidades(!verPossibilidades)} className="mt-16 px-8 py-3 bg-[var(--blue)] text-white rounded-[13px] hover:bg-[var(--white)] hover:text-[var(--blue)] hover:border-[var(--blue)] border border-transparent transition-all duration-300">
                        Ver Possibilidades
                    </button>
                </div>
            </div>
        </div>
    )

};