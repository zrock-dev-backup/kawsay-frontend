{
  description = "Build script";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
      config = if builtins.pathExists (self + "/config.json") 
              then builtins.fromJSON (builtins.readFile (self + "/config.json"))
              else {};
      pkgs = nixpkgs.legacyPackages.${system};

      frontendBuilder = { environment, apiUrl }: pkgs.buildNpmPackage {
      pname = "kawsay-${environment}";
      version = "0.1.0";
      src = ./.;
      nodejs = pkgs.nodejs_24;
      npmDepsHash = "sha256-4dBGWK/ZxvCEDeodrJPeBAt3iwV+hKxAnA8LsCtuimc=";

      buildPhase = ''
        runHook preBuild
        export VITE_API_BASE_URL=${apiUrl}
        npm run build
        runHook postBuild
      '';

      installPhase = ''
      runHook preInstall
      cp -r ./dist/. $out
      runHook postInstall
      '';
      };

      defaultUrls = {
        development = "http://localhost:5167";
        staging = "http://localhost:3000";
        production = "https://api.production.example.com";
      };

      in
      {
        packages = {
          staging = frontendBuilder {
            environment = "staging";
            apiUrl = config.stagingApiUrl or defaultUrls.staging;
          };

          production = frontendBuilder {
            environment = "production";
            apiUrl = config.productionApiUrl or defaultUrls.production;
          };

          development = frontendBuilder {
            environment = "development";
            apiUrl = config.developmentApiUrl or defaultUrls.development;
            };

          default = self.packages.${system}.development;
        };
      }
  );
}

