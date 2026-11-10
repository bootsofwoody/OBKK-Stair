# OBKK-Stair

Browser prototype for studying curved stairs. Blazor WebAssembly handles the
controls and C# calculations. Three.js displays the site model.

## Run locally

Use the .NET 10 SDK and put your site model at
`src/OBKK.Stair.Web/wwwroot/models/base.glb`. This local asset is ignored by Git.

```sh
dotnet run --project src/OBKK.Stair.Web
```

Open the local URL printed by .NET. The 3D viewer loads Three.js from jsDelivr.
The study uses a provisional limit of 16 risers per flight and treats the riser
input as a maximum. The summary is an estimate and the viewport shows the
reference model. Stair mesh generation and Thai code checks are future work.

## GitHub Pages

Publish the standalone app with `dotnet publish src/OBKK.Stair.Web -c Release`
and use the published `wwwroot` as the Pages artifact. Set the base URL in the
published `index.html` to `/OBKK-Stair/` for a project site. Add only model assets
approved for publication to the deployment.
