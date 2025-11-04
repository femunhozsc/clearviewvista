// Dados dos ativos carregados dos arquivos CSV
const ACOES_B3_DATA = [
    { ticker: "COGN3", nome: "Cogna", tipo: "EQUITY" },
    { ticker: "ENEV3", nome: "Eneva", tipo: "EQUITY" },
    { ticker: "AZUL4", nome: "Azul", tipo: "EQUITY" },
    { ticker: "B3SA3", nome: "B3", tipo: "EQUITY" },
    { ticker: "HAPV3", nome: "Hapvida", tipo: "EQUITY" },
    { ticker: "BBDC4", nome: "Banco Bradesco", tipo: "EQUITY" },
    { ticker: "BBAS3", nome: "Banco do Brasil", tipo: "EQUITY" },
    { ticker: "ITSA4", nome: "Itaúsa", tipo: "EQUITY" },
    { ticker: "RADL3", nome: "RaiaDrogasil", tipo: "EQUITY" },
    { ticker: "PETR4", nome: "Petrobras", tipo: "EQUITY" },
    { ticker: "RAIZ4", nome: "Raízen", tipo: "EQUITY" },
    { ticker: "ABEV3", nome: "Ambev", tipo: "EQUITY" },
    { ticker: "GOLL4", nome: "GOL", tipo: "EQUITY" },
    { ticker: "ITUB4", nome: "Itaú Unibanco", tipo: "EQUITY" },
    { ticker: "CPLE6", nome: "Copel", tipo: "EQUITY" },
    { ticker: "VALE3", nome: "Vale", tipo: "EQUITY" },
    { ticker: "MGLU3", nome: "Magazine Luiza", tipo: "EQUITY" },
    { ticker: "UGPA3", nome: "Ultrapar", tipo: "EQUITY" },
    { ticker: "CMIG4", nome: "Cemig", tipo: "EQUITY" },
    { ticker: "PRIO3", nome: "PetroRio", tipo: "EQUITY" },
    { ticker: "CSNA3", nome: "Siderúrgica Nacional", tipo: "EQUITY" },
    { ticker: "CSAN3", nome: "Cosan", tipo: "EQUITY" },
    { ticker: "BBDC3", nome: "Banco Bradesco", tipo: "EQUITY" },
    { ticker: "RAIL3", nome: "Rumo", tipo: "EQUITY" },
    { ticker: "GGBR4", nome: "Gerdau", tipo: "EQUITY" },
    { ticker: "NTCO3", nome: "Natura", tipo: "EQUITY" },
    { ticker: "VIVT3", nome: "Vivo", tipo: "EQUITY" },
    { ticker: "PETR3", nome: "Petrobras", tipo: "EQUITY" },
    { ticker: "GOAU4", nome: "Metalúrgica Gerdau", tipo: "EQUITY" },
    { ticker: "VBBR3", nome: "Vibra Energia", tipo: "EQUITY" },
    { ticker: "CRFB3", nome: "Carrefour Brasil", tipo: "EQUITY" },
    { ticker: "JBSS3", nome: "JBS", tipo: "EQUITY" },
    { ticker: "VAMO3", nome: "Grupo Vamos", tipo: "EQUITY" },
    { ticker: "WEGE3", nome: "WEG", tipo: "EQUITY" },
    { ticker: "TOTS3", nome: "Totvs", tipo: "EQUITY" },
    { ticker: "BEEF3", nome: "Minerva", tipo: "EQUITY" },
    { ticker: "RENT3", nome: "Localiza", tipo: "EQUITY" },
    { ticker: "MOTV3", nome: "Motiva", tipo: "EQUITY" },
    { ticker: "BPAC11", nome: "Banco BTG Pactual", tipo: "EQUITY" },
    { ticker: "CBAV3", nome: "CBA", tipo: "EQUITY" },
    { ticker: "SRNA3", nome: "Serena Energia", tipo: "EQUITY" },
    { ticker: "LREN3", nome: "Lojas Renner", tipo: "EQUITY" },
    { ticker: "PETZ3", nome: "Petz", tipo: "EQUITY" },
    { ticker: "POMO4", nome: "Marcopolo", tipo: "EQUITY" },
    { ticker: "ASAI3", nome: "Assaí", tipo: "EQUITY" },
    { ticker: "SUZB3", nome: "Suzano", tipo: "EQUITY" },
    { ticker: "EQTL3", nome: "Equatorial Energia", tipo: "EQUITY" },
    { ticker: "USIM5", nome: "Usiminas", tipo: "EQUITY" },
    { ticker: "CVCB3", nome: "CVC", tipo: "EQUITY" },
    { ticker: "TIMS3", nome: "TIM", tipo: "EQUITY" },
    { ticker: "CMIN3", nome: "CSN Mineração", tipo: "EQUITY" },
    { ticker: "ELET3", nome: "Eletrobras", tipo: "EQUITY" },
    { ticker: "ANIM3", nome: "Ânima Educação", tipo: "EQUITY" },
    { ticker: "IFCM3", nome: "Infracommerce", tipo: "EQUITY" },
    { ticker: "CASH3", nome: "Méliuz", tipo: "EQUITY" },
    { ticker: "MRVE3", nome: "MRV", tipo: "EQUITY" },
    { ticker: "AURE3", nome: "Auren Energia", tipo: "EQUITY" },
    { ticker: "KLBN11", nome: "Klabin", tipo: "EQUITY" },
    { ticker: "CXSE3", nome: "Caixa Seguridade", tipo: "EQUITY" },
    { ticker: "BBSE3", nome: "BB Seguridade", tipo: "EQUITY" },
    { ticker: "ECOR3", nome: "EcoRodovias", tipo: "EQUITY" },
    { ticker: "BRAV3", nome: "3R Petroleum", tipo: "EQUITY" },
    { ticker: "RAPT4", nome: "Randon", tipo: "EQUITY" },
    { ticker: "LWSA3", nome: "Locaweb", tipo: "EQUITY" },
    { ticker: "SBSP3", nome: "Sabesp", tipo: "EQUITY" },
    { ticker: "MRFG3", nome: "Marfrig", tipo: "EQUITY" },
    { ticker: "PCAR3", nome: "Grupo Pão de Açúcar", tipo: "EQUITY" },
    { ticker: "ENGI11", nome: "Energisa", tipo: "EQUITY" },
    { ticker: "FLRY3", nome: "Fleury", tipo: "EQUITY" },
    { ticker: "RDOR3", nome: "Rede D'Or", tipo: "EQUITY" },
    { ticker: "BRFS3", nome: "BRF", tipo: "EQUITY" },
    { ticker: "EGIE3", nome: "Engie", tipo: "EQUITY" },
    { ticker: "SMFT3", nome: "Smart Fit", tipo: "EQUITY" },
    { ticker: "EMBR3", nome: "Embraer", tipo: "EQUITY" },
    { ticker: "SIMH3", nome: "Simpar", tipo: "EQUITY" },
    { ticker: "STBP3", nome: "Santos Brasil", tipo: "EQUITY" },
    { ticker: "CYRE3", nome: "Cyrela", tipo: "EQUITY" },
    { ticker: "INTB3", nome: "Intelbras", tipo: "EQUITY" },
    { ticker: "CPFE3", nome: "CPFL Energia", tipo: "EQUITY" },
    { ticker: "CURY3", nome: "Cury", tipo: "EQUITY" },
    { ticker: "HYPE3", nome: "Hypera", tipo: "EQUITY" },
    { ticker: "MOVI3", nome: "Movida", tipo: "EQUITY" },
    { ticker: "CPLE3", nome: "Copel", tipo: "EQUITY" },
    { ticker: "IGTI11", nome: "Iguatemi", tipo: "EQUITY" },
    { ticker: "BRKM5", nome: "Braskem", tipo: "EQUITY" },
    { ticker: "BRAP4", nome: "Bradespar", tipo: "EQUITY" },
    { ticker: "JHSF3", nome: "JHSF", tipo: "EQUITY" },
    { ticker: "ALOS3", nome: "Allos", tipo: "EQUITY" },
    { ticker: "OIBR3", nome: "Oi", tipo: "EQUITY" },
    { ticker: "PSSA3", nome: "Porto Seguro", tipo: "EQUITY" },
    { ticker: "LJQQ3", nome: "Lojas Quero-Quero", tipo: "EQUITY" },
    { ticker: "AZZA3", nome: "Arezzo", tipo: "EQUITY" },
    { ticker: "ELET6", nome: "Eletrobras", tipo: "EQUITY" },
    { ticker: "KLBN4", nome: "Klabin", tipo: "EQUITY" },
    { ticker: "AZEV4", nome: "Azevedo & Travassos", tipo: "EQUITY" },
    { ticker: "GGPS3", nome: "GPS", tipo: "EQUITY" },
    { ticker: "SANB11", nome: "Banco Santander", tipo: "EQUITY" },
    { ticker: "TAEE11", nome: "Taesa", tipo: "EQUITY" },
    { ticker: "YDUQ3", nome: "YDUQS", tipo: "EQUITY" },
    { ticker: "HBSA3", nome: "Hidrovias do Brasil", tipo: "EQUITY" },
    { ticker: "GMAT3", nome: "Grupo Mateus", tipo: "EQUITY" },
    { ticker: "QUAL3", nome: "Qualicorp", tipo: "EQUITY" },
    { ticker: "MULT3", nome: "Multiplan", tipo: "EQUITY" },
    { ticker: "TTEN3", nome: "3tentos", tipo: "EQUITY" },
    { ticker: "ISAE4", nome: "ISA Energia", tipo: "EQUITY" },
    { ticker: "VIVA3", nome: "Vivara", tipo: "EQUITY" },
    { ticker: "RCSL4", nome: "Recrusul", tipo: "EQUITY" },
    { ticker: "DIRR3", nome: "Direcional", tipo: "EQUITY" },
    { ticker: "BHIA3", nome: "Casas Bahia", tipo: "EQUITY" },
    { ticker: "ODPV3", nome: "Odontoprev", tipo: "EQUITY" },
    { ticker: "GRND3", nome: "Grendene", tipo: "EQUITY" },
    { ticker: "SBFG3", nome: "Grupo SBF", tipo: "EQUITY" },
    { ticker: "RECV3", nome: "PetroRecôncavo", tipo: "EQUITY" },
    { ticker: "CSMG3", nome: "COPASA", tipo: "EQUITY" },
    { ticker: "CEAB3", nome: "C&A", tipo: "EQUITY" },
    { ticker: "POSI3", nome: "Positivo", tipo: "EQUITY" },
    { ticker: "SMTO3", nome: "São Martinho", tipo: "EQUITY" },
    { ticker: "DXCO3", nome: "Dexco", tipo: "EQUITY" },
    { ticker: "BPAN4", nome: "Banco Pan", tipo: "EQUITY" },
    { ticker: "ALPA4", nome: "Alpargatas", tipo: "EQUITY" },
    { ticker: "SLCE3", nome: "SLC Agrícola", tipo: "EQUITY" },
    { ticker: "VULC3", nome: "Vulcabras", tipo: "EQUITY" },
    { ticker: "GFSA3", nome: "Gafisa", tipo: "EQUITY" },
    { ticker: "AZTE3", nome: "AZT Energia", tipo: "EQUITY" },
    { ticker: "SAPR4", nome: "Sanepar", tipo: "EQUITY" },
    { ticker: "PGMN3", nome: "Pague Menos", tipo: "EQUITY" },
    { ticker: "PDGR3", nome: "PDG Realty", tipo: "EQUITY" },
    { ticker: "EZTC3", nome: "EZTEC", tipo: "EQUITY" },
    { ticker: "TEND3", nome: "Construtora Tenda", tipo: "EQUITY" },
    { ticker: "ALUP11", nome: "Alupar", tipo: "EQUITY" },
    { ticker: "KEPL3", nome: "Kepler Weber", tipo: "EQUITY" },
    { ticker: "ONCO3", nome: "Oncoclínicas", tipo: "EQUITY" },
    { ticker: "AMER3", nome: "Americanas", tipo: "EQUITY" },
    { ticker: "CMIG3", nome: "Cemig", tipo: "EQUITY" },
    { ticker: "MLAS3", nome: "Multilaser", tipo: "EQUITY" },
    { ticker: "SAPR11", nome: "Sanepar", tipo: "EQUITY" },
    { ticker: "IRBR3", nome: "IRB Brasil RE", tipo: "EQUITY" },
    { ticker: "EVEN3", nome: "Even", tipo: "EQUITY" },
    { ticker: "AZEV3", nome: "Azevedo & Travassos", tipo: "EQUITY" },
    { ticker: "PORT3", nome: "Wilson Sons", tipo: "EQUITY" },
    { ticker: "VTRU3", nome: "VITRUBREPCOM", tipo: "EQUITY" },
    { ticker: "KLBN3", nome: "Klabin", tipo: "EQUITY" },
    { ticker: "ENJU3", nome: "Enjoei", tipo: "EQUITY" },
    { ticker: "CAML3", nome: "Camil Alimentos", tipo: "EQUITY" },
    { ticker: "LAVV3", nome: "Lavvi Incorporadora", tipo: "EQUITY" },
    { ticker: "DASA3", nome: "Dasa", tipo: "EQUITY" },
    { ticker: "BRSR6", nome: "Banrisul", tipo: "EQUITY" },
    { ticker: "MILS3", nome: "Mills", tipo: "EQUITY" },
    { ticker: "GUAR3", nome: "Guararapes", tipo: "EQUITY" },
    { ticker: "TRIS3", nome: "Trisul", tipo: "EQUITY" },
    { ticker: "AMBP3", nome: "Ambipar", tipo: "EQUITY" },
    { ticker: "ITUB3", nome: "Itaú Unibanco", tipo: "EQUITY" },
    { ticker: "MYPK3", nome: "Iochpe-Maxion", tipo: "EQUITY" },
    { ticker: "TFCO4", nome: "Track & Field", tipo: "EQUITY" },
    { ticker: "JALL3", nome: "Jalles Machado", tipo: "EQUITY" },
    { ticker: "LIGT3", nome: "Light", tipo: "EQUITY" },
    { ticker: "ARML3", nome: "Armac", tipo: "EQUITY" },
    { ticker: "PLPL3", nome: "Plano&Plano", tipo: "EQUITY" },
    { ticker: "MTRE3", nome: "Mitre Realty", tipo: "EQUITY" },
    { ticker: "ABCB4", nome: "Banco ABC Brasil", tipo: "EQUITY" },
    { ticker: "TUPY3", nome: "Tupy", tipo: "EQUITY" },
    { ticker: "FESA4", nome: "Ferbasa", tipo: "EQUITY" },
    { ticker: "RANI3", nome: "Irani", tipo: "EQUITY" },
    { ticker: "VVEO3", nome: "Viveo", tipo: "EQUITY" },
    { ticker: "ESPA3", nome: "Espaçolaser", tipo: "EQUITY" },
    { ticker: "VLID3", nome: "Valid", tipo: "EQUITY" },
    { ticker: "ZAMP3", nome: "Zamp", tipo: "EQUITY" },
    { ticker: "BRBI11", nome: "BR Partners", tipo: "EQUITY" },
    { ticker: "MBLY3", nome: "Mobly", tipo: "EQUITY" },
    { ticker: "NEOE3", nome: "Neoenergia", tipo: "EQUITY" },
    { ticker: "SEER3", nome: "Ser Educacional", tipo: "EQUITY" },
    { ticker: "POMO3", nome: "Marcopolo", tipo: "EQUITY" },
    { ticker: "PTBL3", nome: "Portobello", tipo: "EQUITY" },
    { ticker: "FRAS3", nome: "Fras-le", tipo: "EQUITY" },
    { ticker: "HBOR3", nome: "Helbor", tipo: "EQUITY" },
    { ticker: "ORVR3", nome: "Orizon", tipo: "EQUITY" },
    { ticker: "MDNE3", nome: "Moura Dubeux", tipo: "EQUITY" },
    { ticker: "MATD3", nome: "Mater Dei", tipo: "EQUITY" },
    { ticker: "SOJA3", nome: "Boa Safra Sementes", tipo: "EQUITY" },
    { ticker: "MDIA3", nome: "M. Dias Branco", tipo: "EQUITY" },
    { ticker: "SHUL4", nome: "Schulz", tipo: "EQUITY" },
    { ticker: "JSLG3", nome: "JSL", tipo: "EQUITY" },
    { ticker: "PRNR3", nome: "Priner", tipo: "EQUITY" },
    { ticker: "SYNE3", nome: "SYN", tipo: "EQUITY" },
    { ticker: "BMGB4", nome: "Banco BMG", tipo: "EQUITY" },
    { ticker: "SAPR3", nome: "Sanepar", tipo: "EQUITY" },
    { ticker: "SEQL3", nome: "Sequoia Logística", tipo: "EQUITY" },
    { ticker: "PMAM3", nome: "Paranapanema", tipo: "EQUITY" },
    { ticker: "CSED3", nome: "Cruzeiro do Sul Educacional", tipo: "EQUITY" },
    { ticker: "USIM3", nome: "Usiminas", tipo: "EQUITY" },
    { ticker: "LEVE3", nome: "Mahle Metal Leve", tipo: "EQUITY" },
    { ticker: "WIZC3", nome: "Wiz Soluções", tipo: "EQUITY" },
    { ticker: "TGMA3", nome: "Tegma", tipo: "EQUITY" },
    { ticker: "EQPA3", nome: "Equatorial Energia Pará", tipo: "EQUITY" },
    { ticker: "FIQE3", nome: "Unifique", tipo: "EQUITY" },
    { ticker: "TASA4", nome: "Taurus", tipo: "EQUITY" },
    { ticker: "BLAU3", nome: "Blau Farmacêutica", tipo: "EQUITY" },
    { ticker: "AMOB3", nome: "Automob", tipo: "EQUITY" },
    { ticker: "BRST3", nome: "Brisanet", tipo: "EQUITY" },
    { ticker: "OPCT3", nome: "OceanPact", tipo: "EQUITY" },
    { ticker: "AMAR3", nome: "Lojas Marisa", tipo: "EQUITY" },
    { ticker: "MEAL3", nome: "IMC Alimentação", tipo: "EQUITY" },
    { ticker: "DESK3", nome: "Desktop", tipo: "EQUITY" },
    { ticker: "HBRE3", nome: "HBR Realty", tipo: "EQUITY" },
    { ticker: "PFRM3", nome: "Profarma", tipo: "EQUITY" },
    { ticker: "TCSA3", nome: "Tecnisa", tipo: "EQUITY" },
    { ticker: "UNIP6", nome: "Unipar", tipo: "EQUITY" },
    { ticker: "MELK3", nome: "Melnick", tipo: "EQUITY" },
    { ticker: "BMOB3", nome: "Bemobi", tipo: "EQUITY" },
    { ticker: "PINE4", nome: "Banco Pine", tipo: "EQUITY" },
    { ticker: "AERI3", nome: "Aeris Energy", tipo: "EQUITY" },
    { ticker: "LOGG3", nome: "LOG CP", tipo: "EQUITY" },
    { ticker: "RCSL3", nome: "Recrusul", tipo: "EQUITY" },
    { ticker: "AGRO3", nome: "BrasilAgro", tipo: "EQUITY" },
    { ticker: "PNVL3", nome: "Dimed", tipo: "EQUITY" },
    { ticker: "WEST3", nome: "Westwing", tipo: "EQUITY" },
    { ticker: "RNEW4", nome: "Renova Energia", tipo: "EQUITY" },
    { ticker: "VITT3", nome: "Vittia", tipo: "EQUITY" },
    { ticker: "ROMI3", nome: "Indústrias ROMI", tipo: "EQUITY" },
    { ticker: "SCAR3", nome: "São Carlos", tipo: "EQUITY" },
    { ticker: "BRAP3", nome: "Bradespar", tipo: "EQUITY" },
    { ticker: "RAPT3", nome: "Randon", tipo: "EQUITY" },
    { ticker: "ETER3", nome: "Eternit", tipo: "EQUITY" },
    { ticker: "TAEE4", nome: "Taesa", tipo: "EQUITY" },
    { ticker: "DEXP3", nome: "Dexxos", tipo: "EQUITY" },
    { ticker: "SHOW3", nome: "Time For Fun", tipo: "EQUITY" },
    { ticker: "TECN3", nome: "Technos", tipo: "EQUITY" },
    { ticker: "FICT3", nome: "Fictor Alimentos", tipo: "EQUITY" },
    { ticker: "DMVF3", nome: "D1000 Varejo Farma", tipo: "EQUITY" },
    { ticker: "ALPK3", nome: "Estapar", tipo: "EQUITY" },
    { ticker: "TAEE3", nome: "Taesa", tipo: "EQUITY" },
    { ticker: "ITSA3", nome: "Itaúsa", tipo: "EQUITY" },
    { ticker: "EUCA4", nome: "Eucatex", tipo: "EQUITY" },
    { ticker: "INEP4", nome: "Inepar", tipo: "EQUITY" },
    { ticker: "VSTE3", nome: "LE LIS BLANC", tipo: "EQUITY" },
    { ticker: "FHER3", nome: "Fertilizantes Heringer", tipo: "EQUITY" },
    { ticker: "AALR3", nome: "Alliança", tipo: "EQUITY" },
    { ticker: "LPSB3", nome: "Lopes", tipo: "EQUITY" },
    { ticker: "UCAS3", nome: "Unicasa", tipo: "EQUITY" },
    { ticker: "LUPA3", nome: "Lupatech", tipo: "EQUITY" },
    { ticker: "IGTI3", nome: "Iguatemi", tipo: "EQUITY" },
    { ticker: "SANB4", nome: "Banco Santander", tipo: "EQUITY" },
    { ticker: "TRAD3", nome: "Traders Club", tipo: "EQUITY" },
    { ticker: "DOTZ3", nome: "Dotz", tipo: "EQUITY" },
    { ticker: "SANB3", nome: "Banco Santander", tipo: "EQUITY" },
    { ticker: "ALLD3", nome: "Allied", tipo: "EQUITY" },
    { ticker: "PDTC3", nome: "Padtec", tipo: "EQUITY" },
    { ticker: "CSUD3", nome: "CSU Cardsystem", tipo: "EQUITY" },
    { ticker: "INEP3", nome: "Inepar", tipo: "EQUITY" },
    { ticker: "GOAU3", nome: "Metalúrgica Gerdau", tipo: "EQUITY" },
    { ticker: "GGBR3", nome: "Gerdau", tipo: "EQUITY" },
    { ticker: "OFSA3", nome: "Ourofino Saúde Animal", tipo: "EQUITY" },
    { ticker: "BRKM3", nome: "Braskem", tipo: "EQUITY" },
    { ticker: "RNEW3", nome: "Renova Energia", tipo: "EQUITY" },
    { ticker: "RSID3", nome: "Rossi Residencial", tipo: "EQUITY" },
    { ticker: "BOBR4", nome: "Bombril", tipo: "EQUITY" },
    { ticker: "BIOM3", nome: "Biomm", tipo: "EQUITY" },
    { ticker: "LVTC3", nome: "WDC Networks", tipo: "EQUITY" },
    { ticker: "CAMB3", nome: "Cambuci", tipo: "EQUITY" },
    { ticker: "AGXY3", nome: "AgroGalaxy", tipo: "EQUITY" },
    { ticker: "TELB3", nome: "Telebras", tipo: "EQUITY" },
    { ticker: "ELMD3", nome: "Eletromidia", tipo: "EQUITY" },
    { ticker: "LAND3", nome: "Terra Santa", tipo: "EQUITY" },
    { ticker: "BMEB4", nome: "Banco Mercantil do Brasil", tipo: "EQUITY" },
    { ticker: "FIEI3", nome: "Fica", tipo: "EQUITY" },
    { ticker: "CEBR6", nome: "CEB", tipo: "EQUITY" },
    { ticker: "RDNI3", nome: "RNI", tipo: "EQUITY" },
    { ticker: "PTNT4", nome: "Pettenati", tipo: "EQUITY" },
    { ticker: "AMAR11", nome: "Lojas Marisa", tipo: "EQUITY" },
    { ticker: "BPAC5", nome: "Banco BTG Pactual", tipo: "EQUITY" },
    { ticker: "EPAR3", nome: "Embpar Participações", tipo: "EQUITY" },
    { ticker: "NUTR3", nome: "Nutriplant", tipo: "EQUITY" },
    { ticker: "BAZA3", nome: "Banco da Amazônia", tipo: "EQUITY" },
    { ticker: "REAG3", nome: "REAG3", tipo: "EQUITY" },
    { ticker: "CLSC4", nome: "Celesc", tipo: "EQUITY" },
    { ticker: "LOGN3", nome: "Log-In", tipo: "EQUITY" },
    { ticker: "ATED3", nome: "ATOM EDUCAÇÃO E EDITORA S.A.", tipo: "EQUITY" },
    { ticker: "VIVR3", nome: "Viver", tipo: "EQUITY" },
    { ticker: "JFEN3", nome: "João Fortes", tipo: "EQUITY" },
    { ticker: "EALT4", nome: "Electro Aço Altona", tipo: "EQUITY" },
    { ticker: "BEES3", nome: "Banestes", tipo: "EQUITY" },
    { ticker: "TASA3", nome: "Taurus", tipo: "EQUITY" },
    { ticker: "CEBR3", nome: "CEB", tipo: "EQUITY" },
    { ticker: "TPIS3", nome: "Triunfo", tipo: "EQUITY" },
    { ticker: "ATMP3", nome: "Atma", tipo: "EQUITY" },
    { ticker: "CEBR5", nome: "CEB", tipo: "EQUITY" },
    { ticker: "LUXM4", nome: "Trevisa", tipo: "EQUITY" },
    { ticker: "OSXB3", nome: "OSX Brasil", tipo: "EQUITY" },
    { ticker: "ALPA3", nome: "Alpargatas", tipo: "EQUITY" },
    { ticker: "TELB4", nome: "Telebras", tipo: "EQUITY" },
    { ticker: "CGRA4", nome: "Grazziotin", tipo: "EQUITY" },
    { ticker: "ALUP4", nome: "Alupar", tipo: "EQUITY" },
    { ticker: "CRPG5", nome: "Tronox Pigmentos", tipo: "EQUITY" },
    { ticker: "CEDO4", nome: "Cedro Têxtil", tipo: "EQUITY" },
    { ticker: "EALT3", nome: "Electro Aço Altona", tipo: "EQUITY" },
    { ticker: "OIBR4", nome: "Oi", tipo: "EQUITY" },
    { ticker: "MGEL4", nome: "Mangels", tipo: "EQUITY" },
    { ticker: "HAGA4", nome: "Haga", tipo: "EQUITY" },
    { ticker: "NGRD3", nome: "Neogrid", tipo: "EQUITY" },
    { ticker: "ENGI4", nome: "Energisa", tipo: "EQUITY" },
    { ticker: "HOOT4", nome: "Hotéis Othon", tipo: "EQUITY" },
    { ticker: "ENGI3", nome: "Energisa", tipo: "EQUITY" },
    { ticker: "BIED3", nome: "BIED3", tipo: "EQUITY" },
    { ticker: "ISAE3", nome: "ISA Energia", tipo: "EQUITY" },
    { ticker: "UNIP3", nome: "Unipar", tipo: "EQUITY" },
    { ticker: "MTSA4", nome: "Metisa", tipo: "EQUITY" },
    { ticker: "WLMM4", nome: "WLM", tipo: "EQUITY" },
    { ticker: "BPAC3", nome: "Banco BTG Pactual", tipo: "EQUITY" },
    { ticker: "WHRL3", nome: "Whirlpool", tipo: "EQUITY" },
    { ticker: "EMAE4", nome: "EMAE", tipo: "EQUITY" },
    { ticker: "MOAR3", nome: "Monteiro Aranha", tipo: "EQUITY" },
    { ticker: "DEXP4", nome: "Dexxos", tipo: "EQUITY" },
    { ticker: "AFLT3", nome: "Afluente T", tipo: "EQUITY" },
    { ticker: "AVLL3", nome: "Alphaville", tipo: "EQUITY" },
    { ticker: "PPLA11", nome: "PPLA", tipo: "EQUITY" },
    { ticker: "BGIP4", nome: "Banese", tipo: "EQUITY" },
    { ticker: "BRSR3", nome: "Banrisul", tipo: "EQUITY" },
    { ticker: "NEXP3", nome: "Brasil Brokers", tipo: "EQUITY" },
    { ticker: "COCE5", nome: "Coelce", tipo: "EQUITY" },
    { ticker: "WHRL4", nome: "Whirlpool", tipo: "EQUITY" },
    { ticker: "RNEW11", nome: "Renova Energia", tipo: "EQUITY" },
    { ticker: "ALUP3", nome: "Alupar", tipo: "EQUITY" },
    { ticker: "BSLI3", nome: "Banco de Brasília", tipo: "EQUITY" },
    { ticker: "NORD3", nome: "Nordon", tipo: "EQUITY" },
    { ticker: "MNPR3", nome: "Minupar", tipo: "EQUITY" },
    { ticker: "PINE3", nome: "Banco Pine", tipo: "EQUITY" },
    { ticker: "CTSA4", nome: "Santanense", tipo: "EQUITY" },
    { ticker: "AZEV11", nome: "Azevedo & Travassos", tipo: "EQUITY" },
    { ticker: "CGAS5", nome: "Comgás", tipo: "EQUITY" },
    { ticker: "BEES4", nome: "Banestes", tipo: "EQUITY" },
    { ticker: "BSLI4", nome: "Banco de Brasília", tipo: "EQUITY" },
    { ticker: "CBEE3", nome: "Ampla Energia", tipo: "EQUITY" },
    { ticker: "ENMT3", nome: "Energisa MT", tipo: "EQUITY" },
    { ticker: "EUCA3", nome: "Eucatex", tipo: "EQUITY" },
    { ticker: "PTNT3", nome: "Pettenati", tipo: "EQUITY" },
    { ticker: "GSHP3", nome: "General Shopping & Outlets", tipo: "EQUITY" },
    { ticker: "HAGA3", nome: "Haga", tipo: "EQUITY" },
    { ticker: "RSUL4", nome: "Metalúrgica Riosulense", tipo: "EQUITY" },
    { ticker: "UNIP5", nome: "Unipar", tipo: "EQUITY" },
    { ticker: "REDE3", nome: "Rede Energia", tipo: "EQUITY" },
    { ticker: "PEAB4", nome: "Participações Aliança da Bahia", tipo: "EQUITY" },
    { ticker: "PATI3", nome: "Panatlântica", tipo: "EQUITY" },
    { ticker: "BALM4", nome: "Baumer", tipo: "EQUITY" }
];

const FUNDOS_DATA = [
    { ticker: "AGRI11", nome: "BB ETF IAGRO", tipo: "ETF" },
    { ticker: "BBOV11", nome: "BB ETF IBOV", tipo: "ETF" },
    { ticker: "BRAZ11", nome: "BB ETF BRAZ", tipo: "ETF" },
    { ticker: "DVER11", nome: "BB ETF DVER", tipo: "ETF" },
    { ticker: "BBOI11", nome: "BB ETF BOI G", tipo: "ETF" },
    { ticker: "DOLA11", nome: "BB ETF DOLAR", tipo: "ETF" },
    { ticker: "CORN11", nome: "BB ETF MILHO", tipo: "ETF" },
    { ticker: "BBSD11", nome: "BB ETF SP DV", tipo: "ETF" },
    { ticker: "TECX11", nome: "B INDEX TECX", tipo: "ETF" },
    { ticker: "BOVA11", nome: "ISHARES IBOV", tipo: "ETF" },
    { ticker: "SMAL11", nome: "ISHARES SMLL", tipo: "ETF" },
    { ticker: "IVVB11", nome: "ISHARES S&P500", tipo: "ETF" },
    { ticker: "XINA11", nome: "XTRACKERS MSCI", tipo: "ETF" },
    { ticker: "ESGB11", nome: "ISHARES ESG", tipo: "ETF" },
    { ticker: "MATB11", nome: "ISHARES MATB", tipo: "ETF" },
    { ticker: "UTIL11", nome: "ISHARES UTIL", tipo: "ETF" },
    { ticker: "FIND11", nome: "ISHARES FIND", tipo: "ETF" },
    { ticker: "ICON11", nome: "ISHARES ICON", tipo: "ETF" },
    { ticker: "ISUS11", nome: "ISHARES ISUS", tipo: "ETF" },
    { ticker: "GOVE11", nome: "ISHARES GOVE", tipo: "ETF" },
    { ticker: "BOVV11", nome: "VANGUARD BOVV", tipo: "ETF" },
    { ticker: "SPXI11", nome: "SPDR S&P500", tipo: "ETF" },
    { ticker: "GOLD11", nome: "SPDR GOLD", tipo: "ETF" },
    { ticker: "HASH11", nome: "HASHDEX HASH", tipo: "ETF" },
    { ticker: "QBTC11", nome: "HASHDEX QBTC", tipo: "ETF" },
    { ticker: "BITH11", nome: "HASHDEX BITH", tipo: "ETF" },
    { ticker: "DEFI11", nome: "HASHDEX DEFI", tipo: "ETF" },
    { ticker: "WEB311", nome: "HASHDEX WEB3", tipo: "ETF" },
    { ticker: "NSDX11", nome: "HASHDEX NSDX", tipo: "ETF" },
    { ticker: "WRLD11", nome: "HASHDEX WRLD", tipo: "ETF" },
    { ticker: "DIVO11", nome: "CSHG DIVO", tipo: "ETF" },
    { ticker: "PIBB11", nome: "CSHG PIBB", tipo: "ETF" },
    { ticker: "BRAX11", nome: "CSHG BRAX", tipo: "ETF" },
    { ticker: "XBOV11", nome: "XPML XBOV", tipo: "ETF" },
    { ticker: "XFIX11", nome: "XPML XFIX", tipo: "ETF" },
    { ticker: "XMAL11", nome: "XPML XMAL", tipo: "ETF" },
    { ticker: "XINA11", nome: "XPML XINA", tipo: "ETF" },
    { ticker: "GGRC11", nome: "GENERAL SHOPPING", tipo: "FII" },
    { ticker: "HGLG11", nome: "CSHG LOGÍSTICA", tipo: "FII" },
    { ticker: "HGRE11", nome: "CSHG REAL ESTATE", tipo: "FII" },
    { ticker: "HGRU11", nome: "CSHG RENDA URBANA", tipo: "FII" },
    { ticker: "HGCR11", nome: "CSHG RECEBÍVEIS", tipo: "FII" },
    { ticker: "HGBS11", nome: "CSHG BRASIL SHOPPING", tipo: "FII" },
    { ticker: "HGFF11", nome: "CSHG FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "HGPO11", nome: "CSHG PORTO", tipo: "FII" },
    { ticker: "HGIC11", nome: "CSHG INCOME", tipo: "FII" },
    { ticker: "HGRS11", nome: "CSHG RENDA SUPERIOR", tipo: "FII" },
    { ticker: "HGRU11", nome: "CSHG RENDA URBANA", tipo: "FII" },
    { ticker: "HGCR11", nome: "CSHG RECEBÍVEIS", tipo: "FII" },
    { ticker: "HGBS11", nome: "CSHG BRASIL SHOPPING", tipo: "FII" },
    { ticker: "HGFF11", nome: "CSHG FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "HGPO11", nome: "CSHG PORTO", tipo: "FII" },
    { ticker: "HGIC11", nome: "CSHG INCOME", tipo: "FII" },
    { ticker: "HGRS11", nome: "CSHG RENDA SUPERIOR", tipo: "FII" },
    { ticker: "KNRI11", nome: "KINEA RENDA IMOBILIÁRIA", tipo: "FII" },
    { ticker: "KNIP11", nome: "KINEA ÍNDICES DE PREÇOS", tipo: "FII" },
    { ticker: "KNCR11", nome: "KINEA CRÉDITO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "KNHY11", nome: "KINEA HIGH YIELD", tipo: "FII" },
    { ticker: "KNSC11", nome: "KINEA SECURITIES", tipo: "FII" },
    { ticker: "KFOF11", nome: "KINEA FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "KNRE11", nome: "KINEA REAL ESTATE", tipo: "FII" },
    { ticker: "MXRF11", nome: "MAXI RENDA", tipo: "FII" },
    { ticker: "XPML11", nome: "XP MALLS", tipo: "FII" },
    { ticker: "XPLG11", nome: "XP LOG", tipo: "FII" },
    { ticker: "XPPR11", nome: "XP PROPERTIES", tipo: "FII" },
    { ticker: "XPCM11", nome: "XP CORPORATE MACAÉ", tipo: "FII" },
    { ticker: "XPCI11", nome: "XP CRÉDITO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "XPIN11", nome: "XP INVESTIMENTOS", tipo: "FII" },
    { ticker: "XPHT11", nome: "XP HOTÉIS", tipo: "FII" },
    { ticker: "XPSF11", nome: "XP SELECTION FoF", tipo: "FII" },
    { ticker: "XPCA11", nome: "XP CRÉDITO AGRÍCOLA", tipo: "FII" },
    { ticker: "XPID11", nome: "XP INDUSTRIAL", tipo: "FII" },
    { ticker: "XPME11", nome: "XP MALLS EUROPA", tipo: "FII" },
    { ticker: "XPPR11", nome: "XP PROPERTIES", tipo: "FII" },
    { ticker: "XPCM11", nome: "XP CORPORATE MACAÉ", tipo: "FII" },
    { ticker: "XPCI11", nome: "XP CRÉDITO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "XPIN11", nome: "XP INVESTIMENTOS", tipo: "FII" },
    { ticker: "XPHT11", nome: "XP HOTÉIS", tipo: "FII" },
    { ticker: "XPSF11", nome: "XP SELECTION FoF", tipo: "FII" },
    { ticker: "XPCA11", nome: "XP CRÉDITO AGRÍCOLA", tipo: "FII" },
    { ticker: "XPID11", nome: "XP INDUSTRIAL", tipo: "FII" },
    { ticker: "XPME11", nome: "XP MALLS EUROPA", tipo: "FII" },
    { ticker: "BTLG11", nome: "BTG PACTUAL LOGÍSTICA", tipo: "FII" },
    { ticker: "BTRA11", nome: "BTG PACTUAL TERRAS AGRÍCOLAS", tipo: "FII" },
    { ticker: "BTCR11", nome: "BTG PACTUAL CRÉDITO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "BTAL11", nome: "BTG PACTUAL ABSOLUTO", tipo: "FII" },
    { ticker: "BTCI11", nome: "BTG PACTUAL CORPORATE INCOME", tipo: "FII" },
    { ticker: "BRCR11", nome: "BC CRÉDITO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "BRCO11", nome: "BC CORPORATE", tipo: "FII" },
    { ticker: "BRLV11", nome: "BC LAJES CORPORATIVAS", tipo: "FII" },
    { ticker: "BRPR11", nome: "BC PROPERTIES", tipo: "FII" },
    { ticker: "BARI11", nome: "BANRISUL RENDA IMOBILIÁRIA", tipo: "FII" },
    { ticker: "BBFI11", nome: "BB RENDA DE PAPÉIS IMOBILIÁRIOS", tipo: "FII" },
    { ticker: "BBPO11", nome: "BB PROGRESSIVO", tipo: "FII" },
    { ticker: "BBRC11", nome: "BB RENDA CORPORATIVA", tipo: "FII" },
    { ticker: "BBVJ11", nome: "BB VOTORANTIM", tipo: "FII" },
    { ticker: "BCFF11", nome: "BRADESCO FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "BCIA11", nome: "BRADESCO CARTEIRA IMOBILIÁRIA ATIVA", tipo: "FII" },
    { ticker: "BCRI11", nome: "BRADESCO CRÉDITO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "BPFF11", nome: "BRASIL PLURAL FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "BPML11", nome: "BRASIL PLURAL MULTIESTRATÉGIA", tipo: "FII" },
    { ticker: "CPTS11", nome: "CAPITÂNIA SECURITIES", tipo: "FII" },
    { ticker: "CPTI11", nome: "CAPITÂNIA INCOME", tipo: "FII" },
    { ticker: "CXRI11", nome: "CAIXA RENDA IMOBILIÁRIA", tipo: "FII" },
    { ticker: "FIIB11", nome: "FATOR VERITA", tipo: "FII" },
    { ticker: "GALG11", nome: "GENERAL SHOPPING SULACAP", tipo: "FII" },
    { ticker: "GGRC11", nome: "GENERAL SHOPPING", tipo: "FII" },
    { ticker: "GTWR11", nome: "GETÚLIO VARGAS", tipo: "FII" },
    { ticker: "HABT11", nome: "HABITAT", tipo: "FII" },
    { ticker: "HCTR11", nome: "HECTARE", tipo: "FII" },
    { ticker: "HFOF11", nome: "HEDGE FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "HGCR11", nome: "HEDGE CRÉDITO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "HGFF11", nome: "HEDGE FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "HGIC11", nome: "HEDGE INCOME", tipo: "FII" },
    { ticker: "HGLG11", nome: "HEDGE LOGÍSTICA", tipo: "FII" },
    { ticker: "HGPO11", nome: "HEDGE PORTO", tipo: "FII" },
    { ticker: "HGRE11", nome: "HEDGE REAL ESTATE", tipo: "FII" },
    { ticker: "HGRS11", nome: "HEDGE RENDA SUPERIOR", tipo: "FII" },
    { ticker: "HGRU11", nome: "HEDGE RENDA URBANA", tipo: "FII" },
    { ticker: "HGBS11", nome: "HEDGE BRASIL SHOPPING", tipo: "FII" },
    { ticker: "HSML11", nome: "HSI MALL", tipo: "FII" },
    { ticker: "HTMX11", nome: "HOTEL MAXINVEST", tipo: "FII" },
    { ticker: "IRDM11", nome: "IRIDIUM RECEBÍVEIS IMOBILIÁRIOS", tipo: "FII" },
    { ticker: "JSRE11", nome: "JS REAL ESTATE", tipo: "FII" },
    { ticker: "KFOF11", nome: "KINEA FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "KISU11", nome: "KINEA SUSTENTABILIDADE", tipo: "FII" },
    { ticker: "KNHY11", nome: "KINEA HIGH YIELD", tipo: "FII" },
    { ticker: "KNIP11", nome: "KINEA ÍNDICES DE PREÇOS", tipo: "FII" },
    { ticker: "KNRE11", nome: "KINEA REAL ESTATE", tipo: "FII" },
    { ticker: "KNRI11", nome: "KINEA RENDA IMOBILIÁRIA", tipo: "FII" },
    { ticker: "KNSC11", nome: "KINEA SECURITIES", tipo: "FII" },
    { ticker: "KNCR11", nome: "KINEA CRÉDITO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "LGCP11", nome: "LOG COMMERCIAL PROPERTIES", tipo: "FII" },
    { ticker: "MALL11", nome: "MULTIPLAN", tipo: "FII" },
    { ticker: "MCCI11", nome: "MAIS CRÉDITO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "MFII11", nome: "MAIS FII", tipo: "FII" },
    { ticker: "MGFF11", nome: "MOGNO FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "MXRF11", nome: "MAXI RENDA", tipo: "FII" },
    { ticker: "NEWL11", nome: "NEWLAND", tipo: "FII" },
    { ticker: "NVHO11", nome: "NOVO HORIZONTE", tipo: "FII" },
    { ticker: "OUJP11", nome: "OURINVEST JUSCELINO", tipo: "FII" },
    { ticker: "PATC11", nome: "PANAMBY", tipo: "FII" },
    { ticker: "PLRI11", nome: "PLURAL RENDA IMOBILIÁRIA", tipo: "FII" },
    { ticker: "PORD11", nome: "PORTO REAL", tipo: "FII" },
    { ticker: "PQAG11", nome: "PARQUE AGRO", tipo: "FII" },
    { ticker: "PVBI11", nome: "PAVARINI", tipo: "FII" },
    { ticker: "QAGR11", nome: "QUASAR AGRO", tipo: "FII" },
    { ticker: "QAMI11", nome: "QUASAR MULTIESTRATÉGIA", tipo: "FII" },
    { ticker: "RBDS11", nome: "RB DESENVOLVIMENTO", tipo: "FII" },
    { ticker: "RBFF11", nome: "RB FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "RBGS11", nome: "RB GESTÃO", tipo: "FII" },
    { ticker: "RBHY11", nome: "RB HIGH YIELD", tipo: "FII" },
    { ticker: "RBIV11", nome: "RB INVESTIMENTOS", tipo: "FII" },
    { ticker: "RBLG11", nome: "RB LOGÍSTICA", tipo: "FII" },
    { ticker: "RBRD11", nome: "RB RENDA", tipo: "FII" },
    { ticker: "RBRF11", nome: "RB REAL ESTATE", tipo: "FII" },
    { ticker: "RBRL11", nome: "RB RENDA LOGÍSTICA", tipo: "FII" },
    { ticker: "RBRS11", nome: "RB RENDA SUPERIOR", tipo: "FII" },
    { ticker: "RBRY11", nome: "RB RENDA YIELD", tipo: "FII" },
    { ticker: "RBTS11", nome: "RB TÍTULOS", tipo: "FII" },
    { ticker: "RBVA11", nome: "RB VAREJO", tipo: "FII" },
    { ticker: "RBVO11", nome: "RB VALOR", tipo: "FII" },
    { ticker: "RECR11", nome: "REC RECEBÍVEIS IMOBILIÁRIOS", tipo: "FII" },
    { ticker: "RECT11", nome: "RECX", tipo: "FII" },
    { ticker: "REIT11", nome: "REAL ESTATE INVESTMENT TRUST", tipo: "FII" },
    { ticker: "RNGO11", nome: "RIO NEGRO", tipo: "FII" },
    { ticker: "RSPD11", nome: "RESPOND", tipo: "FII" },
    { ticker: "RZAG11", nome: "RIZA AGRO", tipo: "FII" },
    { ticker: "RZTR11", nome: "RIZA TERRAX", tipo: "FII" },
    { ticker: "SADI11", nome: "SANTANDER PAPÉIS IMOBILIÁRIOS", tipo: "FII" },
    { ticker: "SDIP11", nome: "SANTANDER DESENVOLVIMENTO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "SNCI11", nome: "SNC LAVAREDO", tipo: "FII" },
    { ticker: "SNFF11", nome: "SANTANDER FUNDO DE FUNDOS", tipo: "FII" },
    { ticker: "SPTW11", nome: "SP DOWNTOWN", tipo: "FII" },
    { ticker: "TGAR11", nome: "TG ATIVO REAL", tipo: "FII" },
    { ticker: "TORD11", nome: "TORRE NORTE", tipo: "FII" },
    { ticker: "TRXF11", nome: "TRX REAL ESTATE", tipo: "FII" },
    { ticker: "URPR11", nome: "URCA PRIME RENDA", tipo: "FII" },
    { ticker: "VCJR11", nome: "VCI JURO REAL", tipo: "FII" },
    { ticker: "VGIR11", nome: "VALORA GESTÃO IMOBILIÁRIA", tipo: "FII" },
    { ticker: "VILG11", nome: "VILA OLÍMPIA CORPORATE", tipo: "FII" },
    { ticker: "VISC11", nome: "VINCI SHOPPING CENTERS", tipo: "FII" },
    { ticker: "VSLH11", nome: "VERSALHES", tipo: "FII" },
    { ticker: "VTLT11", nome: "VOTORANTIM", tipo: "FII" },
    { ticker: "VVPR11", nome: "VIVER", tipo: "FII" },
    { ticker: "WPLZ11", nome: "WEST PLAZA", tipo: "FII" },
    { ticker: "XPCI11", nome: "XP CRÉDITO IMOBILIÁRIO", tipo: "FII" },
    { ticker: "XPHT11", nome: "XP HOTÉIS", tipo: "FII" },
    { ticker: "XPIN11", nome: "XP INVESTIMENTOS", tipo: "FII" },
    { ticker: "XPLG11", nome: "XP LOG", tipo: "FII" },
    { ticker: "XPML11", nome: "XP MALLS", tipo: "FII" },
    { ticker: "XPPR11", nome: "XP PROPERTIES", tipo: "FII" },
    { ticker: "XPSF11", nome: "XP SELECTION FoF", tipo: "FII" },
    { ticker: "XPCM11", nome: "XP CORPORATE MACAÉ", tipo: "FII" },
    { ticker: "XPCA11", nome: "XP CRÉDITO AGRÍCOLA", tipo: "FII" },
    { ticker: "XPID11", nome: "XP INDUSTRIAL", tipo: "FII" },
    { ticker: "XPME11", nome: "XP MALLS EUROPA", tipo: "FII" }
];

// Combina todos os dados
const TODOS_ATIVOS = [...ACOES_B3_DATA, ...FUNDOS_DATA];

// Função para buscar sugestões
function buscarSugestoes(termo) {
    if (!termo || termo.length < 2) return [];
    
    const termoLower = termo.toLowerCase();
    return TODOS_ATIVOS.filter(ativo => 
        ativo.ticker.toLowerCase().includes(termoLower) || 
        ativo.nome.toLowerCase().includes(termoLower)
    ).slice(0, 8);
}

// Funções de formatação (para uso em comparator.js e outros)
function formatarMoeda(valor) {
    if (valor === null || valor === undefined) return 'N/A';
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarPorcentagem(valor) {
    if (valor === null || valor === undefined) return 'N/A';
    return (valor * 100).toFixed(2) + '%';
}

function formatarNumero(valor) {
    if (valor === null || valor === undefined) return 'N/A';
    return valor.toFixed(2).replace('.', ',');
}

function formatarMilhoes(valor) {
    if (valor === null || valor === undefined) return 'N/A';
    if (valor >= 1e12) {
        return (valor / 1e12).toFixed(2).replace('.', ',') + ' T';
    }
    if (valor >= 1e9) {
        return (valor / 1e9).toFixed(2).replace('.', ',') + ' B';
    }
    if (valor >= 1e6) {
        return (valor / 1e6).toFixed(2).replace('.', ',') + ' M';
    }
    return valor.toLocaleString('pt-BR', { maximumFractionDigits: 0 });
}

// Exporta para uso global
window.DADOS_ATIVOS = {
    ACOES_B3_DATA,
    FUNDOS_DATA,
    TODOS_ATIVOS,
    buscarSugestoes,
    formatarMoeda,
    formatarPorcentagem,
    formatarNumero,
    formatarMilhoes
};




document.addEventListener('DOMContentLoaded', (event) => {
    const container = document.getElementById('ativos-populares-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let scrollAmount = 0;

    if (container && prevBtn && nextBtn) {
        const cardWidth = container.querySelector('div').offsetWidth;
        const scrollStep = cardWidth * 2; // Rola 2 cards por vez

        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: scrollStep, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -scrollStep, behavior: 'smooth' });
        });

        container.addEventListener('scroll', () => {
            scrollAmount = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;

            if (scrollAmount > 0) {
                prevBtn.style.display = 'block';
            } else {
                prevBtn.style.display = 'none';
            }

            if (scrollAmount < maxScroll) {
                nextBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'none';
            }
        });
    }
});




document.addEventListener('DOMContentLoaded', (event) => {
    const container = document.getElementById('ativos-populares-container');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    let scrollAmount = 0;

    if (container && prevBtn && nextBtn) {
        // Calculate card width dynamically, assuming all cards have the same width
        const firstCard = container.querySelector('div');
        const cardWidth = firstCard ? firstCard.offsetWidth + 24 : 300; // 24px for space-x-6 (1.5rem * 16px/rem)

        const scrollStep = cardWidth * 2; // Scroll 2 cards at a time

        nextBtn.addEventListener('click', () => {
            container.scrollBy({ left: scrollStep, behavior: 'smooth' });
        });

        prevBtn.addEventListener('click', () => {
            container.scrollBy({ left: -scrollStep, behavior: 'smooth' });
        });

        // Initial check for button visibility
        setTimeout(() => {
            const maxScroll = container.scrollWidth - container.clientWidth;
            if (maxScroll <= 0) {
                nextBtn.style.display = 'none';
            } else {
                nextBtn.style.display = 'block';
            }
            prevBtn.style.display = 'none'; // Always start with prev hidden
        }, 500); // Small delay to ensure content is rendered

        container.addEventListener('scroll', () => {
            scrollAmount = container.scrollLeft;
            const maxScroll = container.scrollWidth - container.clientWidth;

            if (scrollAmount > 0) {
                prevBtn.style.display = 'block';
            } else {
                prevBtn.style.display = 'none';
            }

            if (scrollAmount < maxScroll - 1) { // -1 to account for potential sub-pixel rendering differences
                nextBtn.style.display = 'block';
            } else {
                nextBtn.style.display = 'none';
            }
        });
    }
});



document.addEventListener("DOMContentLoaded", carregarDadosPaginaInicial);




// Lógica do carrossel para ativos populares
let scrollPosition = 0;
const cardWidth = 200; // Largura estimada de cada card + gap

function setupCarousel() {
    const container = document.getElementById('ativos-populares-container');
    const prevBtn = document.getElementById('carousel-prev-btn');
    const nextBtn = document.getElementById('carousel-next-btn');

    if (!container || !prevBtn || !nextBtn) return;

    function updateButtonVisibility() {
        prevBtn.style.display = scrollPosition > 0 ? 'block' : 'none';
        nextBtn.style.display = (container.scrollWidth - container.scrollLeft > container.clientWidth) ? 'block' : 'none';
    }

    nextBtn.addEventListener('click', () => {
        container.scrollBy({ left: cardWidth * 3, behavior: 'smooth' });
    });

    prevBtn.addEventListener('click', () => {
        container.scrollBy({ left: -cardWidth * 3, behavior: 'smooth' });
    });

    container.addEventListener('scroll', () => {
        scrollPosition = container.scrollLeft;
        updateButtonVisibility();
    });

    // Initial check
    setTimeout(updateButtonVisibility, 500);
    window.addEventListener('resize', updateButtonVisibility);
}

// Chamar setupCarousel após o carregamento dos dados da página inicial
// Isso deve ser feito após a renderização do HTML dos ativos populares
const originalRenderizarPaginaInicial = renderizarPaginaInicial;
renderizarPaginaInicial = async (event) => {
    await originalRenderizarPaginaInicial(event);
    setupCarousel();
};

