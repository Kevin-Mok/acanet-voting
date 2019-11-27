const Ballot = artifacts.require('Ballot');
const EllipticCurveLib = artifacts.require('EllipticCurveLib');
const MathEC = artifacts.require('MathEC');
const VoteProofVerifierEC = artifacts.require('VoteProofVerifierEC');
const VoteProofVerifier = artifacts.require('VoteProofVerifier');
const SumProofVerifier = artifacts.require('SumProofVerifier');
const ModuloMathLib = artifacts.require('ModuloMathLib');
const KeyGenProofVerifier = artifacts.require('KeyGenProofVerifier');

module.exports = function(deployer) {
  // link the ModuloMath library
  deployer.deploy(ModuloMathLib);
  deployer.link(ModuloMathLib, [SumProofVerifier, VoteProofVerifier, KeyGenProofVerifier, Ballot]);
  deployer.deploy(SumProofVerifier);
  deployer.deploy(VoteProofVerifier);
  deployer.deploy(KeyGenProofVerifier);
  deployer.deploy(Ballot);

  // link the Elliptic library
  deployer.deploy(EllipticCurveLib);
  deployer.deploy(MathEC);
  deployer.link(EllipticCurveLib, MathEC);
  deployer.link(MathEC, [VoteProofVerifierEC]);
  deployer.deploy(VoteProofVerifierEC);
};
