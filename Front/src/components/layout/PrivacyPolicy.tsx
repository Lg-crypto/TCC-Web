import { privacyPolicyVersion } from "../../constants/privacyPolicy";

export default function PrivacyPolicy() {
  return (
    <div>
      <p>
        Esta política explica quais dados o WWallet usa para oferecer o cadastro
        e o controle de receitas, despesas e assinaturas.
      </p>

      <h3>Dados usados</h3>
      <p>
        Para criar e proteger sua conta, o Firebase Authentication processa seu
        e-mail e os dados de autenticação. Se você entrar com Google, o Google
        fornece os dados básicos do perfil autorizados por você, como nome,
        e-mail e foto. O WWallet não recebe nem armazena sua senha em texto.
      </p>
      <p>
        Os registros financeiros que você cria podem incluir descrição, valor,
        data, categoria, tipo de movimentação, frequência da assinatura e
        comentários. O app também guarda a versão e a data do aceite desta
        política vinculadas ao identificador da sua conta.
      </p>

      <h3>Como os dados são usados e armazenados</h3>
      <p>
        Usamos esses dados para autenticar você, salvar e exibir seus próprios
        registros e manter os recursos do WWallet funcionando. O Firebase
        Authentication e o Cloud Firestore, serviços do Google configurados
        pelo projeto, processam e armazenam os dados necessários. As regras do
        banco limitam a leitura e a alteração dos registros à conta proprietária.
      </p>
      <p>
        As preferências de tema e notificações ficam salvas no seu navegador.
        Se você ativar as notificações, o navegador poderá mostrar o nome de uma
        transação ou assinatura na tela do seu dispositivo.
      </p>
      <p>
        O WWallet não vende seus dados nem os usa para publicidade. O acesso é
        mantido enquanto a conta existir. Ao excluir a conta pelo app, os
        registros e os dados de autenticação também são removidos.
      </p>

      <h3>Seus direitos e contato</h3>
      <p>
        Você pode pedir acesso, correção ou exclusão dos seus dados e tirar
        dúvidas com a equipe responsável pelo projeto WWallet, pelo canal de
        contato fornecido pela instituição ou equipe que disponibilizou esta
        instalação. O app não tem um endereço de contato próprio configurado.
      </p>
      <p>
        Crianças e adolescentes devem ler esta política com um responsável. O
        tratamento de dados considera o melhor interesse de crianças e
        adolescentes, conforme a LGPD.
      </p>

      <p>
        Versão {privacyPolicyVersion} · Última atualização: 25/11/2026
      </p>
    </div>
  );
}
