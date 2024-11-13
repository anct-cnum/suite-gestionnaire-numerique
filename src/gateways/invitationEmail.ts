export const smtpFrom = 'communication@email.conseiller-numerique.gouv.fr'

export const smtpReplyTo = 'conseiller-numerique@anct.gouv.fr'

export function makeMjml(link: string): string {
  return `
    <mjml>
      <mj-head>
        <mj-attributes>
          <mj-all align="center" />
          <mj-all font-size="14px" />
          <mj-all color="#24303A" />
        </mj-attributes>
        <mj-style inline="inline">
          .wrapper { border-radius: 5px; background-color: #fff } .text-primary div { font-size: 24px
          !important; line-height: 29px !important; font-weight: bold !important; } .text-secondary div
          { font-size: 14px !important; line-height: 18px !important; opacity: 0.6 !important; }
          .text-tertiary div { font-size: 12px !important; line-height: 16px !important; }
          .text-highlighted div { color: #F28017 !important; font-weight: bold !important; opacity: 1
          !important; } .box-grey { padding: 10px; background-color: #F4F4F5; border-radius: 5px; }
          .box-light { padding: 10px; border: 1px solid #C8CBCE; border-radius: 5px; } .op-8 { opacity:
          0.8; } .op-6 { opacity: 0.6; } .link { color: inherit; } .link:hover { color: inherit; }
        </mj-style>
      </mj-head>
      <mj-body background-color="#f0f0f0">
        <mj-wrapper css-class="wrapper">
          <mj-section>
            <mj-column>
              <mj-text
                css-class="text-primary"
                padding-bottom="30px"
                font-weight="bold"
                font-size="20px"
                align="center"
              >
                Bienvenue sur le tableau de pilotage Conseiller numérique 🎉
              </mj-text>
              <mj-divider width="50%" padding-bottom="30px"></mj-divider>
              <mj-text>
                ✨ Le tableau de pilotage permet de suivre les indicateurs essentiels des conseillers
                numérique et des structures grâce à une interface simple et personnalisée.
              </mj-text>
              <mj-text font-weight="bold"> Inclusion connect c’est quoi ? </mj-text>
              <mj-text>
                Un système d'authentification unique (SSO - Single Sign-on), une méthode
                d’identification et d’authentification permettant à un utilisateur d'accéder à plusieurs
                applications ou sites web en ne procédant qu'à une seule authentification.<br />
                Pour faire simple : vous créez un seul compte, sur une solution « centrale », qui vous
                facilitera l’accès à plusieurs sites ou application web.
              </mj-text>
              <mj-text font-weight="bold">
                👉 Vous ne possédez pas de compte Inclusion Connect
              </mj-text>
              <mj-text font-weight="bold" color="#4A86E8"> 1. Connexion </mj-text>
              <mj-text>
                Cliquez sur le bouton « Lien d’invitation » en bas du mail pour être redirigé sur la
                page de connexion.
              </mj-text>
              <mj-text font-weight="bold" color="#4A86E8"> 2. Création du compte </mj-text>
              <mj-text>
                Une fois redirigé sur Inclusion Connect, cliquez sur le bouton «Créer un compte » en bas
                du formulaire de connexion, renseignez vos informations et cliquez sur « Créer un
                compte ».
              </mj-text>
              <mj-text>
                Si au bout de 10 minutes vous n’avez pas reçu d’e-mail pour activer votre compte,
                vérifiez dans vos spams et sinon cliquez sur «Cliquez ici » pour renvoyer le courriel.
              </mj-text>
              <mj-text font-weight="bold" color="#4A86E8"> 3. Validation </mj-text>
              <mj-text>
                En cliquant sur le lien reçu par e- mail,vous êtes connecté automatiquement sur
                Inclusion Connect et redirigé vers le tableau de pilotage.
              </mj-text>
              <mj-text font-weight="bold"> 👉 Si vous avez déjà un compte Inclusion Connect : </mj-text>
              <mj-text font-weight="bold" color="#4A86E8"> 1. Connexion </mj-text>
              <mj-text> Cliquez sur le bouton « Lien d’invitation » en bas du mail. </mj-text>
              <mj-text font-weight="bold" color="#4A86E8"> 2. Identification </mj-text>
              <mj-text>
                Renseignez votre e-mail et mot de passe de compte Inclusion Connect. Vous serez ensuite
                redirigé automatiquement vers le tableau de pilotage.
              </mj-text>
              <mj-text font-weight="bold"> 👉 Vous êtes déjà connecté à Inclusion Connect </mj-text>
              <mj-text font-weight="bold" color="#4A86E8"> 1. Connexion </mj-text>
              <mj-text>
                Cliquez sur le bouton « Lien d’invitation » en bas du mail. Une fois sur la page de
                connexion Inclusion Connect, vos informations seront renseignées, vous n’aurez qu'à
                cliquer sur « Se connecter » pour être redirigé automatiquement vers le tableau de
                pilotage.
              </mj-text>
            </mj-column>
          </mj-section>
          <mj-section css-class="box" padding-top="0" padding-left="100px" padding-right="100px">
            <mj-column border="1px solid #C8CBCE">
              <mj-button
                href="${link}"
                background-color="#24303A"
                color="#F4F4F5"
                font-size="16px"
                font-weight="bold"
                text-transform="uppercase"
              >
                Lien d'invitation
              </mj-button>
            </mj-column>
          </mj-section>
          <mj-column width="600px">
            <mj-button
              font-size="14px"
              href="mailto:${smtpReplyTo}"
              text-decoration="underline"
              background-color
              color="#24303A"
            >
              Vous n’arrivez pas à créer votre compte ?
            </mj-button>
          </mj-column>
        </mj-wrapper>
        <mj-wrapper css-class="wrapper">
          <mj-section>
            <mj-column>
              <mj-text css-class="text-secondary" padding-bottom="0"> Très cordialement, </mj-text>
              <mj-text css-class="text-secondary" padding-top="0">
                L'équipe Conseiller Numérique
              </mj-text>
            </mj-column>
          </mj-section>
        </mj-wrapper>
      </mj-body>
    </mjml>
  `
}
