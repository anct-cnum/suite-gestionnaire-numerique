function itemAvantage(contenu: string): string {
  return `
        <mj-text font-size="16px" line-height="24px" color="#3A3A3A" align="left" padding="16px 40px 0 40px">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%">
            <tr>
              <td style="width:28px;vertical-align:top">✅</td>
              <td style="vertical-align:top">${contenu}</td>
            </tr>
          </table>
        </mj-text>`
}

export const confirmationLabellisationEmailTemplate = `<mjml background-color="#f6f6f6">
  <mj-head>
    <mj-attributes>
      <mj-all font-family="Marianne, Helvetica, Arial, sans-serif" />
    </mj-attributes>
  </mj-head>
  <mj-body background-color="#f6f6f6" width="640px">
    <mj-section background-color="#f6f6f6" padding="20px 0"></mj-section>
    <mj-section background-color="#ffffff" padding="0px" border-radius="8px">
      <mj-column width="100%">
        <mj-image
          src="<%= logoConumUrl %>"
          alt="Conseiller Numérique"
          width="34px"
          align="left"
          padding="40px 40px 8px 40px"
        />
        <mj-text
          font-size="14px"
          font-weight="700"
          line-height="16px"
          color="#000000"
          align="left"
          padding="0 40px 40px 40px"
        >
          CONSEILLER<br/>NUMÉRIQUE
        </mj-text>
        <mj-divider border-color="#DDDDDD" border-width="1px" padding="0 40px" />
        <mj-text
          font-size="32px"
          font-weight="700"
          line-height="40px"
          color="#000091"
          align="left"
          padding="40px 40px 0 40px"
        >
          Votre structure est labellisée conseiller numérique
        </mj-text>
        <mj-text font-size="16px" line-height="24px" color="#3A3A3A" align="left" padding="40px 40px 0 40px">
          Bonjour <%= prenom %> <%= nom %>,
        </mj-text>
        <mj-text font-size="16px" line-height="24px" color="#3A3A3A" align="left" padding="24px 40px 0 40px">
          Nous avons le plaisir de vous confirmer que votre structure
          <strong><%= nomStructure %></strong> a obtenu le label conseiller numérique.
        </mj-text>
        <mj-text font-size="16px" line-height="24px" color="#3A3A3A" align="left" padding="24px 40px 0 40px">
          Ce label reconnaît son engagement dans la médiation numérique et l’inscrit dans le réseau
          national animé par l’ANCT.
        </mj-text>
        <mj-text
          font-size="16px"
          font-weight="700"
          line-height="24px"
          color="#3A3A3A"
          align="left"
          padding="40px 40px 0 40px"
        >
          Le label vous donne accès à :
        </mj-text>${itemAvantage(
          '<strong>Formation continue</strong> - 1 module par an financé par l’État'
        )}${itemAvantage(
          '<strong>Communauté professionnelle</strong> - réseau national des médiateurs numériques'
        )}${itemAvantage(
          '<strong>Marque conseiller numérique</strong> - identité visuelle et supports de communication'
        )}${itemAvantage('<strong>Outils</strong> - La Coop, Les Bases et les ressources partagées')}
        <mj-text
          font-size="16px"
          font-weight="700"
          line-height="24px"
          color="#3A3A3A"
          align="left"
          padding="40px 40px 0 40px"
        >
          Et ensuite ?
        </mj-text>
        <mj-text font-size="16px" line-height="24px" color="#3A3A3A" align="left" padding="24px 40px 0 40px">
          Votre label est actif dès aujourd’hui et valable 1 an. Le
          <strong><%= dateRenouvellement %></strong>, vous recevrez un mail pour confirmer que votre
          structure poursuit son activité de médiation numérique et renouveler le label en un clic.
        </mj-text>
        <mj-button
          href="<%= link %>"
          background-color="#ffffff"
          color="#000091"
          border="1px solid #DDDDDD"
          font-size="16px"
          font-weight="500"
          line-height="24px"
          border-radius="0px"
          width="100%"
          inner-padding="12px 24px"
          padding="40px 40px 0 40px"
        >
          Voir le statut de mon label
        </mj-button>
        <mj-text font-size="16px" line-height="24px" color="#3A3A3A" align="left" padding="40px 40px 0 40px">
          Cordialement,
        </mj-text>
        <mj-text
          font-size="16px"
          font-weight="700"
          line-height="24px"
          color="#3A3A3A"
          align="left"
          padding="24px 40px 0 40px"
        >
          L’équipe conseiller numérique<br/>
          Agence Nationale de la Cohésion des Territoires
        </mj-text>
        <mj-image
          src="<%= logoAnctUrl %>"
          alt="Agence Nationale de la Cohésion des Territoires"
          width="169px"
          align="left"
          padding="40px 40px 40px 40px"
        />
        <mj-divider border-color="#DDDDDD" border-width="1px" padding="0 40px" />
        <mj-text font-size="12px" line-height="20px" color="#666666" align="left" padding="40px 40px 40px 40px">
          Pour toute question, contactez votre coordinateur territorial<br/>
          ou écrivez à labellisation@conseiller-numerique.gouv.fr
        </mj-text>
      </mj-column>
    </mj-section>
    <mj-section background-color="#f6f6f6" padding="20px 0"></mj-section>
  </mj-body>
</mjml>
`
