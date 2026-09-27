import styles from "./about.module.css";
import background from "../assets/logo-clara.png";
import image from "../assets/image1.png";
import fotoHigor from "../assets/Higor.png"
import fotoYoshida from "../assets/Yoshida.png"
import fotoHalejandro from "../assets/Halejandro.png"
import fotoCaio from "../assets/Caio.jpg"

import SideMenu from "../components/layout/sideMenu";


export default function About (){
    return(
        <div className={styles.container}>
            <SideMenu></SideMenu>
            <section className={`${styles.section} ${styles.home}`}>
                <img src={background} alt="WWallet" />
                <h1 className={styles.title}>Sobre o WWallet</h1>
            </section>
            <section className={`${styles.section} ${styles.howstarted}`}>
                <h2 className={styles.title}>Como começou</h2>
                <div className={styles.texts}>
                    <p className={styles.text}>
                        O WWallet nasceu de uma necessidade real: acompanhar melhor o dinheiro que entra e sai. Durante a definição do projeto, Caio compartilhou a dificuldade de organizar os gastos pessoais. A ideia inspirou a equipe a criar uma aplicação web de controle financeiro, na qual cada pessoa pode registrar receitas e despesas e entender melhor sua vida financeira.
                    </p>
                </div>
            </section>
            <section className={`${styles.section} ${styles.ourmission}`}>
                <div className={styles.content}>
                    <img className={styles.missionImage} width={960} height={600} src={image} alt="Ilustração sobre planejamento financeiro" />
                    <div>
                        <h2 className={styles.title}>Nossa missão</h2>
                        <ul className={styles.list}>
                            <li><h3 className={styles.listDescription}>Controle financeiro para qualquer pessoa</h3><p className={styles.listItem}>Organize receitas e despesas sem complicação.</p></li>
                            <li><h3 className={styles.listDescription}>Visualização inteligente</h3><p className={styles.listItem}>Gráficos claros para acompanhar sua evolução.</p></li>
                            <li><h3 className={styles.listDescription}>Simples e rápido</h3><p className={styles.listItem}>Cadastre movimentações em poucos segundos.</p></li>
                            <li><h3 className={styles.listDescription}>Seus dados protegidos</h3><p className={styles.listItem}>Segurança e privacidade em primeiro lugar.</p></li>
                        </ul>
                    </div>
                </div>
            </section>
            <section className={`${styles.section} ${styles.aboutus}`}>
                <h2 className={styles.title}>Sobre nós</h2>
                <div className={styles.profiles}>
                    <div className={styles.profile}>
                        <img src={fotoHalejandro} className={styles.profileImage} alt="Francisco Halejandro" />
                        <div>
                            <h3 className={styles.subtitle}>Francisco Halejandro</h3>
                            <p className={styles.text}>Olá! Meu nome é Halejandro, sou uma pessoa curiosa, criativa e apaixonada por aprender coisas novas. Gosto de encarar desafios como oportunidades para evoluir e estou sempre em busca de aprimorar minhas habilidades, tanto na programação quanto em outras áreas do conhecimento.</p>
                            <p className={styles.text}>Tenho um grande interesse por desenvolvimento web, especialmente utilizando React e TypeScript, e procuro criar interfaces modernas, intuitivas e bem estruturadas, sempre pensando na experiência do usuário e na qualidade do código. Além da tecnologia, gosto de explorar assuntos variados, como futebol, jogos, história da arte, astronomia e acontecimentos atuais, o que me ajuda a desenvolver uma visão mais ampla e a aprender continuamente. Costumo analisar os problemas antes de resolvê-los, buscando entender suas causas e encontrar soluções eficientes e bem elaboradas. Acredito que a evolução vem da curiosidade, da dedicação e da vontade constante de fazer cada vez melhor.</p>
                        </div>
                    </div>
                    <div className={`${styles.profile} ${styles.reverse}`}>
                        <img src={fotoCaio} className={styles.profileImage} alt="Caio de Matos" />
                        <div>
                            <h3 className={styles.subtitle}>Caio de Matos</h3>
                            <p className={styles.text}>Olá! Meu nome é Caio, sou um estudante do curso de Desenvolvimento de sistemas da ETEC de Hortolândia, com interesses na área de tecnologia (mas sem uma área específica ainda) e em linguagens, além de uma grande afinidade com a perfumaria e a indústria de jogos. Venho buscando crescer principalmente emocionalmente e mentalmente para conseguir me dedicar a minha vida pessoal e profissional para realizar meus sonhos.</p>
                        </div>
                    </div>
                    <div className={styles.profile}>
                        <img src={fotoYoshida} className={styles.profileImage} alt="Bernardo Matos Yoshida" />
                        <div>
                            <h3 className={styles.subtitle}>Bernardo Matos Yoshida</h3>
                            <p className={styles.text}>Olá! Meu nome é Bernardo Matos Yoshida e sou estudante da área de Desenvolvimento de Sistemas com interesse em Engenharia da área de Computação, e tenho afinidades com audiovisual e interesse em mercado global. Tenho buscado desenvolver minhas habilidades por meio de projetos acadêmicos e pessoais, sempre procurando aprender novas tecnologias e aperfeiçoar meus conhecimentos.</p>
                        </div>
                    </div>
                    <div className={`${styles.profile} ${styles.reverse}`}>
                        <img src={fotoHigor} className={styles.profileImage} alt="Higor Gabriel" />
                        <div>
                            <h3 className={styles.subtitle}>Higor Gabriel</h3>
                            <p className={styles.text}>Sou aluno do 3º ano do curso técnico em Desenvolvimento de Sistemas. Meu interesse pela área de programação surgiu por meio do contato com profissionais da tecnologia, o que despertou minha vontade de aprender e seguir carreira na área. Durante o curso, desenvolvi familiaridade com o ambiente de desenvolvimento, adquirindo conhecimentos em lógica de programação, conceitos fundamentais e boas práticas, além de fortalecer meu interesse em criar soluções por meio da tecnologia.</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
