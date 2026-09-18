import { existsSync, readFileSync, statSync } from "node:fs";

const manifest = JSON.parse(readFileSync("manifest.json", "utf8"));
const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
const versions = JSON.parse(readFileSync("versions.json", "utf8"));
const errors = [];

if (manifest.id !== "icon-fairy" || manifest.name !== "Icon Fairy") {
	errors.push("manifest.id and manifest.name must use the canonical identity icon-fairy / Icon Fairy");
}

if (!/^[a-z-]+$/.test(manifest.id) || manifest.id.includes("obsidian") || manifest.id.endsWith("plugin")) {
	errors.push("manifest.id must use lowercase letters and hyphens, exclude 'obsidian', and not end with 'plugin'");
}

if (!manifest.name || /obsidian|plugin/i.test(manifest.name)) {
	errors.push("manifest.name must be present and exclude 'Obsidian' and 'Plugin'");
}

if (
	typeof manifest.description !== "string" ||
	manifest.description.length > 250 ||
	!/[.!?]$/.test(manifest.description)
) {
	errors.push("manifest.description must be 250 characters or fewer and end with punctuation");
}

if (manifest.version !== packageJson.version) {
	errors.push(`version mismatch: manifest ${manifest.version}, package ${packageJson.version}`);
}

const displayNameSlug = manifest.name.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replaceAll(/(^-|-$)/g, "");
const expectedPackageName = `obsidian-${displayNameSlug}`;
if (packageJson.name !== expectedPackageName) {
	errors.push(`package name ${packageJson.name} must match manifest name slug ${expectedPackageName}`);
}

if (versions[manifest.version] !== manifest.minAppVersion) {
	errors.push(`versions.json must map ${manifest.version} to ${manifest.minAppVersion}`);
}

const sampleVault = "examples/programming-languages-vault";
const samplePlugin = `${sampleVault}/.obsidian/plugins/icon-fairy`;
const sampleManifest = JSON.parse(readFileSync(`${samplePlugin}/manifest.json`, "utf8"));
for (const field of ["id", "name", "version", "minAppVersion"]) {
	if (sampleManifest[field] !== manifest[field]) {
		errors.push(`sample manifest.${field} must match the release manifest`);
	}
}

const sampleEnabled = JSON.parse(readFileSync(`${sampleVault}/.obsidian/community-plugins.json`, "utf8"));
if (!Array.isArray(sampleEnabled) || sampleEnabled.length !== 1 || sampleEnabled[0] !== manifest.id) {
	errors.push("sample community-plugins.json must enable only icon-fairy");
}

const sampleLibrary = JSON.parse(readFileSync(`${samplePlugin}/icon-library.json`, "utf8"));
const sampleLogo = sampleLibrary.icons.find((icon) => icon.id === "icon-fairy");
if (sampleLogo?.name !== "Icon Fairy" || sampleLogo?.path !== "icons/icon-fairy.png") {
	errors.push("sample logo must use icon-fairy / Icon Fairy / icons/icon-fairy.png");
}
for (const icon of sampleLibrary.icons) {
	const asset = `${samplePlugin}/${icon.path}`;
	if (!existsSync(asset) || !statSync(asset).isFile() || statSync(asset).size === 0) {
		errors.push(`missing or empty sample library image: ${icon.path}`);
	}
}

const sampleData = JSON.parse(readFileSync(`${samplePlugin}/data.json`, "utf8"));
for (const [path, icon] of Object.entries(sampleData.iconMap)) {
	if (!existsSync(`${sampleVault}/${path}`)) {
		errors.push(`sample icon mapping points to a missing file or folder: ${path}`);
	}
	if (icon.type === "custom" && !sampleLibrary.icons.some((entry) => entry.id === icon.value)) {
		errors.push(`sample icon mapping references a missing library icon: ${icon.value}`);
	}
}

for (const asset of ["main.js", "manifest.json", "styles.css"]) {
	if (!existsSync(asset) || statSync(asset).size === 0) {
		errors.push(`missing or empty release asset: ${asset}`);
	}
}

if (existsSync("styles.css")) {
	const stylesheet = readFileSync("styles.css", "utf8");
	if (readFileSync(`${samplePlugin}/styles.css`, "utf8") !== stylesheet) {
		errors.push("sample styles.css must match the release stylesheet");
	}
	if (/!\s*important\b/i.test(stylesheet)) {
		errors.push("styles.css must use scoped selectors instead of !important");
	}
	if (/:has\s*\(/i.test(stylesheet)) {
		errors.push("styles.css must use explicit state classes instead of :has()");
	}
}

if (errors.length > 0) {
	for (const error of errors) console.error(`Release check failed: ${error}`);
	process.exit(1);
}

console.log(`Release metadata and assets are valid for ${manifest.name} ${manifest.version}.`);
