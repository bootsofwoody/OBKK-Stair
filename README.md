# OBKK-Stair

Browser prototype for studying curved stairs. Blazor WebAssembly handles the
controls and C# calculations. Three.js displays the site model.

## Run locally

Use the .NET 10 SDK. The site model is included at
`src/OBKK.Stair.Web/wwwroot/models/base2.glb`.

```sh
dotnet run --project src/OBKK.Stair.Web
```

Open the local URL printed by .NET. The 3D viewer loads Three.js from jsDelivr.
The study uses a provisional limit of 16 risers per flight and treats the riser
input as a maximum. The summary is an estimate and the viewport shows the
reference model. Stair mesh generation and Thai code checks are future work.

## GitHub Pages

In the repository's **Settings → Pages → Build and deployment**, select
**GitHub Actions** as the source. The `Deploy website to GitHub Pages` workflow
publishes the app and its model when changes are pushed to `main`. You can also
run it manually from the **Actions** tab.

The workflow builds the app into static files, sets the base path for the Pages
URL, and deploys the published `wwwroot` directory. The entry page is
`index.html`. Browsers load the published app and model from that directory.
