prod-dockerBuild:
	nix build '.#dockerImageProduction'
	docker load < result

stage-dockerBuild:
	nix build '.#dockerImageStaging'
	docker load < result

docker-publish:
	docker push 1kawsay/frontend-kawsay:production-latest

update-export:
	rm /tmp/frontend-update.zip
	git diff --name-only HEAD src/ | xargs -r zip /tmp/frontend-update.zip

format:
	git add src/
	git status --porcelain src/ | awk '{print $$2}' | xargs npx prettier --write

run:
	nix run
