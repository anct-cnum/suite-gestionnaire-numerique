export const smtpFrom = 'communication@email.conseiller-numerique.gouv.fr'

export const smtpReplyTo = 'conseiller-numerique@anct.gouv.fr'

export function makeMjml(link: string): string {
  return `
<mj-body>
    <mj-head>
        <mj-attributes>
            <mj-all align="center" />
            <mj-all font-size="14px" />
            <mj-all color="#24303a" />
        </mj-attributes>
        <mj-style inline="inline">
            .wrapper {
                border-radius: 5px;
                background-color: #fff
            }

            .text-primary div {
                font-size: 24px !important;
                line-height: 29px !important;
                font-weight: bold !important;
            }

            .text-secondary div {
                font-size: 14px !important;
                line-height: 18px !important;
                opacity: 0.6 !important;
            }

            .text-tertiary div {
                font-size: 12px !important;
                line-height: 16px !important;
            }

            .text-highlighted div {
                color: #f28017 !important;
                font-weight: bold !important;
                opacity: 1 !important;
            }

            .box-grey {
                padding: 10px;
                background-color: #f4f4f5;
                border-radius: 5px;
            }

            .box-light {
                padding: 10px;
                border: 1px solid #c8cbce;
                border-radius: 5px;
            }

            .op-8 {
                opacity: 0.8;
            }

            .op-6 {
                opacity: 0.6;
            }

            .link {
                color: inherit;
            }

            .link:hover {
                color: inherit;
            }
        </mj-style>
    </mj-head>
    <mj-body background-color="#f0f0f0">
        <mj-section padding="8px"></mj-section>
        <mj-wrapper css-class="wrapper">
            <mj-section>
                <mj-column>
                    <mj-text css-class="text-primary" padding-bottom="30px" font-weight="bold" font-size="20px"
                        align="center">
                        Bienvenue sur le tableau de pilotage Conseiller numérique 🎉
                    </mj-text>
                    <mj-divider width="50%" padding-bottom="30px"></mj-divider>
                    <mj-text>
                        ✨ Le tableau de pilotage permet de suivre les indicateurs
                        essentiels des conseillers numériques et des structures grâce à une
                        interface simple et personnalisée.
                    </mj-text>
                    <mj-text font-weight="bold" color="#4A86E8">
                        1. Rejoignez le tableau de pilotage
                    </mj-text>
                    <mj-text>
                        Cliquez sur le bouton « Lien d’invitation » en bas du mail pour être
                        redirigé sur la page de connexion.
                    </mj-text>
                    <mj-text font-weight="bold">
                        👉 Si vous n'avez pas de compte ProConnect :
                    </mj-text>
                    <mj-text font-weight="bold" color="#4A86E8">
                        2. Création du compte
                    </mj-text>
                    <mj-text>
                        Une fois redirigé sur ProConnect, cliquez sur le bouton
                        « Créer un compte » en bas du formulaire de connexion, renseignez vos
                        informations et cliquez sur « Créer un compte ».
                    </mj-text>
                    <mj-text>
                        Si au bout de 10 minutes vous n’avez pas reçu d’e-mail pour activer
                        votre compte, vérifiez dans vos spams ou cliquez cliquez sur « Cliquez
                        ici » pour renvoyer le courriel.
                    </mj-text>
                    <mj-text font-weight="bold" color="#4A86E8">
                        3. Validation
                    </mj-text>
                    <mj-text>
                        En cliquant sur le lien reçu par e- mail,vous êtes connecté
                        automatiquement sur ProConnect et redirigé vers le tableau
                        de pilotage.
                    </mj-text>
                    <mj-text font-weight="bold">
                        👉 Vous avez un compte ProConnect :
                    </mj-text>
                    <mj-text font-weight="bold" color="#4A86E8">
                        2. Identification
                    </mj-text>
                    <mj-text>
                        Renseignez votre e-mail et mot de passe de compte ProConnect.
                        Vous serez ensuite redirigé automatiquement vers le tableau de
                        pilotage.
                    </mj-text>
                    <mj-text font-weight="bold">
                        👉 Vous êtes déjà connecté à ProConnect
                    </mj-text>
                    <mj-text font-weight="bold" color="#4A86E8">
                        1. Connexion
                    </mj-text>
                    <mj-text>
                        Cliquez sur le bouton « Lien d’invitation » en bas du mail. Une fois
                        sur la page de connexion ProConnect, vos informations seront
                        renseignées, vous n’aurez qu'à cliquer sur « Se connecter » pour
                        être redirigé automatiquement vers le tableau de pilotage.
                    </mj-text>
                </mj-column>
            </mj-section>
            <mj-section css-class="box" padding-top="0" padding-left="100px" padding-right="100px">
                <mj-column border="1px solid #C8CBCE">
                    <mj-button href="${link}" background-color="#24303A" color="#F4F4F5" font-size="16px"
                        font-weight="bold" text-transform="uppercase">
                        Lien d'invitation
                    </mj-button>
                    <mj-text font-size="14px" line-height="21px" align="center" text-decoration="underline">
                        (Ce lien expire dans 4 semaines)
                    </mj-text>
                </mj-column>
            </mj-section>
            <mj-column width="600px">
            <mj-button font-size="14px" href="mailto:${smtpReplyTo}" text-decoration="underline"
                    background-color color="#24303A">
                    Vous n’arrivez pas à créer votre compte ?
                </mj-button>
            </mj-column>
        </mj-wrapper>
        <mj-wrapper css-class="wrapper">
            <mj-section>
                <mj-column> <%- include('../commun/signature.mjml.ejs'); %> </mj-column>
            </mj-section>
        </mj-wrapper>
    </mj-body>
</mj-body>
  `
}
