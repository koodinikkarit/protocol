// Generated by the protocol buffer compiler.  DO NOT EDIT!
// source: proto/CommandBuff.proto
#pragma warning disable 1591, 0612, 3021
#region Designer generated code

using pb = global::Google.Protobuf;
using pbc = global::Google.Protobuf.Collections;
using pbr = global::Google.Protobuf.Reflection;
using scg = global::System.Collections.Generic;
/// <summary>Holder for reflection information generated from proto/CommandBuff.proto</summary>
[global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
public static partial class CommandBuffReflection {

  #region Descriptor
  /// <summary>File descriptor for proto/CommandBuff.proto</summary>
  public static pbr::FileDescriptor Descriptor {
    get { return descriptor; }
  }
  private static pbr::FileDescriptor descriptor;

  static CommandBuffReflection() {
    byte[] descriptorData = global::System.Convert.FromBase64String(
        string.Concat(
          "Chdwcm90by9Db21tYW5kQnVmZi5wcm90byINCgtDb21tYW5kQnVmZmIGcHJv",
          "dG8z"));
    descriptor = pbr::FileDescriptor.FromGeneratedCode(descriptorData,
        new pbr::FileDescriptor[] { },
        new pbr::GeneratedCodeInfo(null, new pbr::GeneratedCodeInfo[] {
          new pbr::GeneratedCodeInfo(typeof(global::CommandBuff), global::CommandBuff.Parser, null, null, null, null)
        }));
  }
  #endregion

}
#region Messages
[global::System.Diagnostics.DebuggerNonUserCodeAttribute()]
public sealed partial class CommandBuff : pb::IMessage<CommandBuff> {
  private static readonly pb::MessageParser<CommandBuff> _parser = new pb::MessageParser<CommandBuff>(() => new CommandBuff());
  public static pb::MessageParser<CommandBuff> Parser { get { return _parser; } }

  public static pbr::MessageDescriptor Descriptor {
    get { return global::CommandBuffReflection.Descriptor.MessageTypes[0]; }
  }

  pbr::MessageDescriptor pb::IMessage.Descriptor {
    get { return Descriptor; }
  }

  public CommandBuff() {
    OnConstruction();
  }

  partial void OnConstruction();

  public CommandBuff(CommandBuff other) : this() {
  }

  public CommandBuff Clone() {
    return new CommandBuff(this);
  }

  public override bool Equals(object other) {
    return Equals(other as CommandBuff);
  }

  public bool Equals(CommandBuff other) {
    if (ReferenceEquals(other, null)) {
      return false;
    }
    if (ReferenceEquals(other, this)) {
      return true;
    }
    return true;
  }

  public override int GetHashCode() {
    int hash = 1;
    return hash;
  }

  public override string ToString() {
    return pb::JsonFormatter.ToDiagnosticString(this);
  }

  public void WriteTo(pb::CodedOutputStream output) {
  }

  public int CalculateSize() {
    int size = 0;
    return size;
  }

  public void MergeFrom(CommandBuff other) {
    if (other == null) {
      return;
    }
  }

  public void MergeFrom(pb::CodedInputStream input) {
    uint tag;
    while ((tag = input.ReadTag()) != 0) {
      switch(tag) {
        default:
          input.SkipLastField();
          break;
      }
    }
  }

}

#endregion


#endregion Designer generated code