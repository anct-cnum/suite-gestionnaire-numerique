export interface Destinataire {
  email: string
  nom: string
  prenom: string
}

export const invitationEmailTemplate = `<mjml background-color="#f6f6f6">
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Marianne, Helvetica, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f6f6f6">
    <mj-section background-color="#f6f6f6" padding="20px 0"></mj-section>
    <mj-section background-color="#ffffff" padding="0px" border-radius="8px">
      <mj-column width="24%" padding="0" vertical-align="middle">
        <mj-image
          src="<%= logoFrUrl %>"
          alt="République Française"
          width="94px"
          align="left"
          padding="10px 0 10px 25px"
        />
      </mj-column>
      <mj-column width="76%" padding="0px 0px 0px 35px" vertical-align="middle">
        <mj-image
          src="<%= logominUrl %>"
          alt="Logo Min"
          width="94px"
          align="left"
          padding="10px 25px 10px 0"
        />
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="0px" border-radius="8px">
      <mj-column width="100%">
        <mj-text
          font-size="28px"
          font-weight="600"
          color="#000091"
          align="left"
          padding="24px 25px 0 25px"
        >
          Invitation à rejoindre Mon Inclusion Numérique
        </mj-text>
        <mj-text font-size="16px" color="#000000" align="left" padding="32px 25px 30px 25px">
          Bonjour <%= prenom %> <%= nom %>,<br/>
          <br/>
          Vous êtes invité à rejoindre Mon Inclusion Numérique, l'outil de pilotage de la
          politique d'inclusion numérique sur votre territoire.
        </mj-text>
        <mj-button
          href="<%= link %>"
          background-color="#000091"
          color="#ffffff"
          font-size="16px"
          font-weight="400"
          border-radius="0px"
          padding="16px 25px 0 25px"
        >
          Rejoindre Mon Inclusion Numérique
        </mj-button>
        <mj-text align="center" font-size="14px" color="#24303A" padding="32px 25px 0 25px">
          <a
            href="<%= linkAide %>"
            style="color: #24303a; text-decoration: underline"
          >
            Vous n'arrivez pas à vous connecter avec ProConnect ?
          </a>
        </mj-text>
        <mj-divider border-color="#DDDDDD" border-width="1px" padding="24px 0 0 0" />
      </mj-column>
    </mj-section>
    <mj-section background-color="#ffffff" padding="0 0 8px 0">
      <mj-column width="24%">
        <mj-image
          src="<%= logoFrUrl %>"
          alt="République Française"
          width="94px"
          align="left"
          padding="10px 25px"
        />
      </mj-column>
      <mj-column width="76%">
        <mj-image
          src="<%= logoAnctUrl %>"
          alt="Logo ANCT"
          width="200px"
          align="left"
          padding="16px 1px 0 25px"
        />
      </mj-column>
    </mj-section>
    <mj-section background-color="#f6f6f6" padding="20px 0"></mj-section>
  </mj-body>
</mjml>
` 