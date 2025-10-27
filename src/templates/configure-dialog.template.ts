export const configureDialogTemplate = (
    officerndFlexUrl: string,
    orgName: string,
) => `<!DOCTYPE html>
<html>
<head>
    <title>Configure Integration</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 40px;
            max-width: 800px;
            margin: 0 auto;
        }
        h1 {
            color: #333;
        }
        .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #007bff;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            margin-top: 20px;
            cursor: pointer;
        }
        .button:hover {
            background-color: #0056b3;
        }
    </style>
</head>
<body>
    <h1>Configure page UI for configuring integration for ${orgName} goes here!</h1>
    <a href="${officerndFlexUrl}/connect/external-integration/return" class="button">Continue</a>
</body>
</html>`;
