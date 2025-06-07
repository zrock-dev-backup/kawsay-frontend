{
  description = "Build script";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        defaultPackage =
        pkgs.buildNpmPackage {
        pname = "kawsay";
        version = "0.1.0";
        src = ./.;
        nodejs = pkgs.nodejs_24;
        npmDepsHash = "sha256-4dBGWK/ZxvCEDeodrJPeBAt3iwV+hKxAnA8LsCtuimc=" ;

        installPhase = ''
          runHook preInstall
          cp -r ./dist/. $out
          runHook postInstall
          '';
        };
      }
  );
}

