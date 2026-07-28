type VerificationEmailTemplateProps = {
    name: string;
    verificationUrl: string;
};

export function verificationEmailTemplate({
    name,
    verificationUrl,
}: VerificationEmailTemplateProps) {
    const safeName = escapeHtml(name);

    return `
        <!DOCTYPE html>
        <html lang="es">
            <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Verifica tu correo</title>
            </head>

            <body style="
                margin: 0;
                padding: 0;
                background-color: #f4f4f5;
                font-family: Arial, Helvetica, sans-serif;
                color: #18181b;
            ">
                <table
                    role="presentation"
                    width="100%"
                    cellspacing="0"
                    cellpadding="0"
                    style="padding: 40px 16px;"
                >
                    <tr>
                        <td align="center">
                            <table
                                role="presentation"
                                width="100%"
                                cellspacing="0"
                                cellpadding="0"
                                style="
                                    max-width: 560px;
                                    background-color: #ffffff;
                                    border-radius: 20px;
                                    overflow: hidden;
                                    border: 1px solid #e4e4e7;
                                "
                            >
                                <tr>
                                    <td style="
                                        background-color: #09090b;
                                        padding: 28px 32px;
                                        text-align: center;
                                    ">
                                        <h1 style="
                                            margin: 0;
                                            color: #ffffff;
                                            font-size: 26px;
                                            letter-spacing: -0.5px;
                                        ">
                                            LOS BOSS
                                        </h1>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="padding: 36px 32px;">
                                        <h2 style="
                                            margin: 0 0 16px;
                                            font-size: 24px;
                                            color: #18181b;
                                        ">
                                            Verifica tu correo electrónico
                                        </h2>

                                        <p style="
                                            margin: 0 0 14px;
                                            color: #52525b;
                                            font-size: 16px;
                                            line-height: 1.6;
                                        ">
                                            Hola, ${safeName}.
                                        </p>

                                        <p style="
                                            margin: 0 0 26px;
                                            color: #52525b;
                                            font-size: 16px;
                                            line-height: 1.6;
                                        ">
                                            Confirma tu correo electrónico para activar tu cuenta
                                            y comenzar a utilizar Los Boss.
                                        </p>

                                        <table
                                            role="presentation"
                                            cellspacing="0"
                                            cellpadding="0"
                                            style="margin: 0 auto 28px;"
                                        >
                                            <tr>
                                                <td
                                                    align="center"
                                                    style="
                                                        background-color: #09090b;
                                                        border-radius: 12px;
                                                    "
                                                >
                                                    <a
                                                        href="${verificationUrl}"
                                                        style="
                                                            display: inline-block;
                                                            padding: 15px 28px;
                                                            color: #ffffff;
                                                            text-decoration: none;
                                                            font-size: 15px;
                                                            font-weight: bold;
                                                        "
                                                    >
                                                        Verificar mi correo
                                                    </a>
                                                </td>
                                            </tr>
                                        </table>

                                        <p style="
                                            margin: 0 0 10px;
                                            color: #71717a;
                                            font-size: 13px;
                                            line-height: 1.6;
                                        ">
                                            Este enlace expirará en 24 horas.
                                        </p>

                                        <p style="
                                            margin: 0;
                                            color: #71717a;
                                            font-size: 13px;
                                            line-height: 1.6;
                                            word-break: break-all;
                                        ">
                                            Si el botón no funciona, copia y pega este enlace en tu navegador:
                                            <br />
                                            <a
                                                href="${verificationUrl}"
                                                style="color: #18181b;"
                                            >
                                                ${verificationUrl}
                                            </a>
                                        </p>
                                    </td>
                                </tr>

                                <tr>
                                    <td style="
                                        padding: 22px 32px;
                                        background-color: #fafafa;
                                        border-top: 1px solid #e4e4e7;
                                        text-align: center;
                                    ">
                                        <p style="
                                            margin: 0;
                                            color: #a1a1aa;
                                            font-size: 12px;
                                            line-height: 1.5;
                                        ">
                                            Si no creaste una cuenta en Los Boss,
                                            puedes ignorar este mensaje.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </body>
        </html>
    `;
}

function escapeHtml(value: string) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}